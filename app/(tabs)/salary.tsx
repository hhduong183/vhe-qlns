import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function SalaryScreen() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all'); // Start with 'all' to get yearly data
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);
  const [salaryList, setSalaryList] = useState([]);
  const [yearlySalaryData, setYearlySalaryData] = useState({});
  const [hasAutoSelectedMonth, setHasAutoSelectedMonth] = useState(false);

  // Month mapping similar to PHP code
  const months = {
    'all': 'Tất cả các tháng',
    '01': 'Tháng 1',
    '02': 'Tháng 2',
    '03': 'Tháng 3',
    '04': 'Tháng 4',
    '05': 'Tháng 5',
    '06': 'Tháng 6',
    '07': 'Tháng 7',
    '08': 'Tháng 8',
    '09': 'Tháng 9',
    '10': 'Tháng 10',
    '11': 'Tháng 11',
    '12': 'Tháng 12'
  };

  // Initial data loading - get yearly data first
  useEffect(() => {
    if (!hasAutoSelectedMonth) {
      fetchSalaryData();
    }
  }, []);

  // Fetch data when selectedMonth or selectedYear changes (after auto-selection)
  useEffect(() => {
    if (hasAutoSelectedMonth) {
      fetchSalaryData();
    }
  }, [selectedMonth, selectedYear, hasAutoSelectedMonth]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      // Get user ID from storage - using same approach as in home.tsx
      let id = null;

      try {
        const userData = await AsyncStorage.getItem('userData');
        console.log('userData từ AsyncStorage:', userData);

        if (userData) {
          const userDataObj = JSON.parse(userData);
          console.log('userData đã parse:', userDataObj);

          if (userDataObj && userDataObj.id) {
            id = userDataObj.id;
            console.log('Đã lấy được ID từ AsyncStorage:', id);
          } else {
            console.log('Không tìm thấy ID trong userData');
          }
        } else {
          console.log('Không tìm thấy userData trong AsyncStorage');
        }
      } catch (error) {
        console.error('Lỗi khi đọc AsyncStorage:', error);
      }

      // Use default ID if not found
      if (!id) {
        id = 1; // ID mặc định để test
        console.log('Sử dụng ID mặc định:', id);
      }

      // Fetch salary data from API
      const response = await fetch(
        `https://test.vhe.com.vn/api/salary_app.php?id=${id}&month=${selectedMonth}&year=${selectedYear}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

      // Get the raw text response first to debug
      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      // Then try to parse it as JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed JSON data:', result);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Show detailed info about the response that failed parsing
        console.log('Response starts with:', responseText.substring(0, 100));
        setLoading(false);
        return;
      }

      if (result && result.success) {
        setSalaryList(result.salaryList || []);
        setYearlySalaryData(result.yearlySalaryData || {});

        // Auto-select the most recent month with data ONLY during initial load
        if (!hasAutoSelectedMonth && selectedMonth === 'all' && Object.keys(result.yearlySalaryData || {}).length > 0) {
          // Find the most recent month with data
          const availableMonths = Object.keys(result.yearlySalaryData)
            .sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order (12 to 01)

          if (availableMonths.length > 0) {
            const latestMonth = availableMonths[0];
            console.log('Auto-selecting most recent month with salary data:', latestMonth);

            // Mark as processed BEFORE changing the month to avoid double fetching
            setHasAutoSelectedMonth(true);

            // Brief timeout to ensure state updates in the correct order
            setTimeout(() => {
              setSelectedMonth(latestMonth);
            }, 50);
          } else {
            setHasAutoSelectedMonth(true);
          }
        }

        // Set first salary as selected if available - for specific month view
        if (selectedMonth !== 'all' && result.salaryList && result.salaryList.length > 0 && !selectedSalaryId) {
          setSelectedSalaryId(result.salaryList[0].luong_id);
        }
      } else {
        console.error('API trả về dữ liệu không hợp lệ:', result);
        if (!hasAutoSelectedMonth && selectedMonth === 'all') {
          setHasAutoSelectedMonth(true); // Mark as processed even if API response is invalid
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu lương:', error);
      // Print more details about the error
      if (error instanceof TypeError) {
        console.error('Chi tiết lỗi:', error.message);
      }
      setLoading(false);

      if (!hasAutoSelectedMonth && selectedMonth === 'all') {
        setHasAutoSelectedMonth(true); // Mark as processed even if there's an error
      }
    }
  };

  // Cập nhật hàm formatNumber để hiển thị đẹp hơn
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0 ₫';

    // Xử lý giá trị 0
    if (value === 0) return '0 ₫';

    // Chuyển đổi sang chuỗi và đảm bảo là số nguyên
    const numberValue = Math.round(parseFloat(value));

    // Định dạng với dấu phẩy ngăn cách hàng nghìn và thêm đơn vị tiền tệ
    return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
  };

  // Display row only if value > 0 (similar to PHP displayRow function)
  const DisplayRow = ({ label, value, formatAsNumber = true, isDeduction = false }) => {
    if (value <= 0) return null;

    return (
      <View style={[styles.tableRow, isDeduction && styles.deductionRow]}>
        <Text style={styles.tableLabel}>{label}</Text>
        <Text style={[styles.tableValue, isDeduction && styles.deductionText]}>
          {formatAsNumber ? formatNumber(value) : value}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Đang tải dữ liệu lương...</Text>
      </View>
    );
  }

  // Find selected salary
  const selectedSalary = salaryList.find(salary =>
    salary.luong_id === selectedSalaryId) || null;

  // Calculate salary components - similar to the PHP calculateSalaryComponents function
  const calculateSalary = (salary) => {
    if (!salary) return { thuNhapChinh: 0, thunhapKhac: 0, tongLuong: 0 };



    const thuNhapChinh =
      (Number(salary?.thunhap_a) || 0) +
      (Number(salary?.thunhap_b) || 0) +
      (Number(salary?.thunhap_c) || 0);

    const thunhapKhac =
      (Number(salary?.thuong_tet) || 0) +
      (Number(salary?.thuong_duan) || 0) +
      (Number(salary?.thuong_hoanthue) || 0) +
      (Number(salary?.ml_khac) || 0);

    const tongLuong =
      thuNhapChinh +
      thunhapKhac -
      (Number(salary?.kt_bhxh) || 0) -
      (Number(salary?.kt_tncn) || 0) -
      (Number(salary?.kt_congdoan) || 0) -
      (Number(salary?.kt_khac) || 0) -
      (Number(salary?.chua_tt) || 0);


    return { thuNhapChinh, thunhapKhac, tongLuong };
  };

  const calculatedSalary = selectedSalary
    ? calculateSalary(selectedSalary)
    : { thuNhapChinh: 0, thunhapKhac: 0, tongLuong: 0 };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          BẢNG LƯƠNG {months[selectedMonth].toUpperCase()} NĂM {selectedYear}
        </Text>
      </View>

      {/* Month Selector - Horizontal Buttons */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Chọn tháng</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScrollView}>
          <TouchableOpacity
            style={[
              styles.monthButton,
              selectedMonth === 'all' && styles.selectedMonthButton
            ]}
            onPress={() => {
              setSelectedMonth('all');
              setSelectedSalaryId(null);
            }}
          >
            <Text style={[
              styles.monthButtonText,
              selectedMonth === 'all' && styles.selectedMonthText
            ]}>
              Tất cả
            </Text>
          </TouchableOpacity>

          {Object.entries(months)
            .filter(([key]) => key !== 'all') // Exclude 'all' as it's already added
            .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by month number ascending
            .map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.monthButton,
                  selectedMonth === key && styles.selectedMonthButton
                ]}
                onPress={() => {
                  setSelectedMonth(key);
                  setSelectedSalaryId(null);
                }}
              >
                <Text style={[
                  styles.monthButtonText,
                  selectedMonth === key && styles.selectedMonthText
                ]}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* Year Selector */}
      <View style={styles.yearSelectorContainer}>
        <TouchableOpacity
          style={styles.yearButton}
          onPress={() => {
            const prevYear = (parseInt(selectedYear) - 1).toString();
            setSelectedYear(prevYear);
          }}
        >
          <FontAwesome name="chevron-left" size={16} color="#3c8dbc" />
        </TouchableOpacity>

        <Text style={styles.yearText}>Năm {selectedYear}</Text>

        <TouchableOpacity
          style={styles.yearButton}
          onPress={() => {
            const nextYear = (parseInt(selectedYear) + 1).toString();
            setSelectedYear(nextYear);
          }}
        >
          <FontAwesome name="chevron-right" size={16} color="#3c8dbc" />
        </TouchableOpacity>
      </View>

      {selectedMonth === 'all' ? (
        // Display all months summary
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tổng hợp lương năm {selectedYear}</Text>
          </View>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Tháng</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>
                Lương thực lĩnh
              </Text>
            </View>

            {Object.keys(yearlySalaryData).length > 0 ? (
              Object.entries(yearlySalaryData)
                .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by month number
                .map(([month, data]) => (
                  <View key={month} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{months[month]}</Text>
                    <Text style={styles.tableValue}>{formatNumber(data.tongLuongThucLinh)}</Text>
                  </View>
                ))
            ) : (
              <Text style={styles.emptyText}>Không có dữ liệu lương</Text>
            )}
          </View>
        </View>
      ) : (
        // Display single month details
        <>
          {/* Salary List */}
          {salaryList.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Phiếu lương</Text>
              </View>
              <View style={styles.salaryListContainer}>
                {salaryList.map((salary) => (
                  <TouchableOpacity
                    key={salary.luong_id}
                    style={[
                      styles.salaryButton,
                      salary.luong_id === selectedSalaryId && styles.selectedSalaryButton
                    ]}
                    onPress={() => setSelectedSalaryId(salary.luong_id)}
                  >
                    <Text
                      style={[
                        styles.salaryButtonText,
                        salary.luong_id === selectedSalaryId && styles.selectedSalaryText
                      ]}
                    >
                      {salary.ma_luong}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedSalary ? (
            <>
              {/* Attendance Info */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Thông tin chấm công</Text>
                </View>
                <View style={styles.cardBody}>
                  <DisplayRow label="Số ngày làm việc" value={selectedSalary.ngaycong} formatAsNumber={false} />
                  <DisplayRow label="Số giờ ra ngoài" value={selectedSalary.hr_rangoai} formatAsNumber={false} />
                  <DisplayRow label="Số giờ OVT" value={selectedSalary.hr_ovt} formatAsNumber={false} />
                  <DisplayRow label="Số giờ OVT CN" value={selectedSalary.hr_ovtCN} formatAsNumber={false} />
                  <DisplayRow label="Số giờ OVT Lễ" value={selectedSalary.hr_ovtLe} formatAsNumber={false} />
                  <DisplayRow label="Hệ số sản lượng (HS1)" value={selectedSalary.hs_sanluong} formatAsNumber={false} />
                  <DisplayRow label="Hệ số APQ (HS2)" value={selectedSalary.hs_apq} formatAsNumber={false} />
                </View>
              </View>

              {/* Salary and Allowances */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Lương và Phụ cấp</Text>
                </View>
                <View style={styles.cardBody}>
                  <DisplayRow label="Mức lương chính" value={selectedSalary.ml_chinh} />
                  <DisplayRow label="PC. Trách nhiệm" value={selectedSalary.pc_trachnhiem} />
                  <DisplayRow label="PC. Nghề" value={selectedSalary.pc_nghe} />
                  <DisplayRow label="PC. Nhà trọ" value={selectedSalary.pc_nhatro} />
                  <DisplayRow label="PC. Công trường" value={selectedSalary.pc_congtruong} />
                  <DisplayRow label="PC. Ăn ca" value={selectedSalary.pc_anca} />
                  <DisplayRow label="OVT Chịu thuế" value={selectedSalary.ovt_thue} />
                  <DisplayRow label="OVT Không thuế" value={selectedSalary.ovt_kothue} />
                  <DisplayRow label="Thưởng TẾT" value={selectedSalary.thuong_tet} />
                  <DisplayRow label="Thưởng dự án" value={selectedSalary.thuong_duan} />
                  <DisplayRow label="Hoàn thuế TNCN" value={selectedSalary.thuong_hoanthue} />

                  {/* Highlight các khoản thu nhập khác với style đặc biệt */}
                  <View style={[styles.summaryRow, styles.highlightRow]}>
                    <Text style={styles.summaryLabel}>Các khoản thu nhập khác</Text>
                    <Text style={[styles.summaryValue, styles.highlightText]}>
                      {formatNumber(calculatedSalary.thunhapKhac)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Salary Summary */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Tổng hợp lương</Text>
                </View>
                <View style={styles.cardBody}>
                  <DisplayRow label="A = 70%(ML+PCTN) + PC khác" value={selectedSalary.thunhap_a} />
                  <DisplayRow label="B = 30%(ML+PCTN)*(HS1+HS2)/2" value={selectedSalary.thunhap_b} />
                  <DisplayRow label="C = Tổng lương OVT *HS1" value={selectedSalary.thunhap_c} />

                  {/* Thu nhập chính với style nổi bật */}
                  <View style={[styles.summaryRow, styles.highlightRow]}>
                    <Text style={styles.summaryLabel}>Thu nhập chính (A+B+C)</Text>
                    <Text style={[styles.summaryValue, styles.highlightText]}>
                      {formatNumber(calculatedSalary.thuNhapChinh)}
                    </Text>
                  </View>

                  {/* Phần khấu trừ */}
                  <DisplayRow
                    label="Đoàn phí công đoàn"
                    value={selectedSalary.kt_congdoan}
                    isDeduction={true} />
                  <DisplayRow
                    label="Bảo hiểm Xã hội (10.5%)"
                    value={selectedSalary.kt_bhxh}
                    isDeduction={true} />
                  <DisplayRow
                    label="Thuế TNCN phải nộp"
                    value={selectedSalary.kt_tncn}
                    isDeduction={true} />

                  <View style={[styles.summaryRow, styles.deduction]}>
                    <Text style={styles.summaryLabel}>Các khoản khấu trừ khác</Text>
                    <Text style={[styles.summaryValue, styles.deductionText]}>
                      {formatNumber(selectedSalary.kt_khac)}
                    </Text>
                  </View>

                  {/* Tổng lương thực lĩnh */}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng lương thực lĩnh</Text>
                    <Text style={styles.totalValue}>
                      {formatNumber(calculatedSalary.tongLuong)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <FontAwesome name="exclamation-triangle" size={24} color="#dc3545" />
              <Text style={styles.emptyText}>Không có dữ liệu lương cho tháng này</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    backgroundColor: '#3c8dbc',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectorCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
    color: '#555',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    height: 50,  // Increase height for better touch target
  },
  picker: {
    height: 50,  // Increase height
    width: '100%',
    color: '#333', // Ensure text is visible
  },
  card: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: '#3c8dbc',
    padding: 12,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cardBody: {
    padding: 12,
  },
  salaryListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  salaryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    margin: 4,
  },
  selectedSalaryButton: {
    backgroundColor: '#3c8dbc',
  },
  salaryButtonText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 12,
  },
  selectedSalaryText: {
    color: 'white',
  },
  tableContainer: {
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableLabel: {
    flex: 1.5,
    fontSize: 13,
    color: '#555',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  tableValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fffde7',
    paddingHorizontal: 4,
    marginVertical: 4,
  },
  deduction: {
    backgroundColor: '#ffebee',
  },
  deductionRow: {
    backgroundColor: '#ffebee',
  },
  deductionText: {
    color: '#dc3545',
  },
  summaryLabel: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#555',
    flex: 2,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: '#3c8dbc',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  totalLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  monthScrollView: {
    flexDirection: 'row',
    padding: 10,
  },
  monthButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginVertical: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedMonthButton: {
    backgroundColor: '#3c8dbc',
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  selectedMonthText: {
    color: 'white',
  },
  yearSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  yearButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 15,
  },
  highlightRow: {
    backgroundColor: '#e8f5e9',
  },
  highlightText: {
    color: '#388e3c',
  },
});