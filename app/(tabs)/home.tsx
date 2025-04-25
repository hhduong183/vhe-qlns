import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('rewards');
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Thử lấy thông tin người dùng từ AsyncStorage
      let id = null; // Đặt id là null ban đầu
      
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
      } catch (storageError) {
        console.error('Lỗi khi đọc AsyncStorage:', storageError);
      }
      
      // Sử dụng ID mặc định nếu không tìm thấy
      if (!id) {
        id = 1; // ID mặc định để test
        console.log('Sử dụng ID mặc định:', id);
      }
      
      console.log('Đang gửi yêu cầu đến API với ID:', id);
      
      const response = await fetch(`https://bakup.vhe.com.vn/api/profile_app.php?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      console.log('Dữ liệu hồ sơ nhận được:', result);
      
      if (result && result.success) {
        console.log('Dữ liệu hợp lệ, đang cập nhật state');
        setProfileData({
          employeeData: result.employeeData,
          khenThuong: result.khenThuong || [],
          kyLuat: result.kyLuat || [],
          contracts: result.contracts || [],
          dependents: result.dependents || []
        });
      } else {
        console.error('API trả về dữ liệu không hợp lệ:', result);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin hồ sơ:', error);
      setLoading(false);
    }
  };

  const toggleCard = (id) => {
    setExpandedCards({
      ...expandedCards,
      [id]: !expandedCards[id]
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // Thêm log để kiểm tra
  console.log('Profile data có tồn tại?', profileData !== null);

  const employeeData = profileData?.employeeData || {
    id: 1,
    ma_nv: "VHE001",
    hinh_anh: "default-avatar.png",
    ten_nv: "Nguyễn Văn A",
    gioi_tinh: 1,
    ngay_tao: "2020-01-01",
    ngay_sinh: "1990-01-01",
    so_cmnd: "123456789",
    ten_tinh_trang: "Độc thân",
    ngay_cap_cmnd: "2015-01-01",
    noi_cap_cmnd: "Công an TP.HCM",
    nguyen_quan: "TP.HCM",
    ten_quoc_tich: "Việt Nam",
    ten_dan_toc: "Kinh",
    ten_ton_giao: "Không",
    ho_khau: "TP.HCM",
    ten_loai_nv: "Nhân viên chính thức",
    ten_trinh_do: "Đại học",
    ten_chuyen_mon: "Công nghệ thông tin",
    ten_bang_cap: "Cử nhân",
    ten_phong_ban: "IT",
    ten_chuc_vu: "Nhân viên",
    ngay_vao_lam: "2020-01-01",
    so_dth: "0901234567",
    trang_thai: 1,
    ma_so_thue: "1234567890"
  };

  // Dữ liệu khen thưởng và kỷ luật
  const rewardData = profileData?.khenThuong || [];
  const disciplineData = profileData?.kyLuat || [];
  
  // Dữ liệu hợp đồng
  const contractsData = profileData?.contracts || [];
  
  // Dữ liệu người phụ thuộc
  const dependentsData = profileData?.dependents || [];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông tin nhân viên</Text>
        <Text style={styles.employeeId}>Mã NV: {employeeData.ma_nv}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: `https://bakup.vhe.com.vn/uploads/staffs/${employeeData.hinh_anh}` }} 
            style={styles.profileImage}
            defaultSource={require('../../assets/default-avatar.png')}
          />
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên nhân viên:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_nv}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{employeeData.gioi_tinh === 1 ? "Nam" : "Nữ"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>
              {new Date(employeeData.ngay_sinh).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tình trạng HN:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_tinh_trang}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số CCCD:</Text>
            <Text style={styles.infoValue}>{employeeData.so_cmnd}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày cấp:</Text>
            <Text style={styles.infoValue}>
              {new Date(employeeData.ngay_cap_cmnd).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nơi cấp:</Text>
            <Text style={styles.infoValue}>{employeeData.noi_cap_cmnd}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nguyên quán:</Text>
            <Text style={styles.infoValue}>{employeeData.nguyen_quan}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quốc tịch:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_quoc_tich}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dân tộc:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_dan_toc}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tôn giáo:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_ton_giao}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{employeeData.so_dth}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nơi ở hiện tại:</Text>
            <Text style={styles.infoValue}>{employeeData.ho_khau}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Loại nhân viên:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_loai_nv}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trình độ:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_trinh_do}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chuyên môn:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_chuyen_mon}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bằng cấp:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_bang_cap}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phòng ban:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_phong_ban}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chức vụ:</Text>
            <Text style={styles.infoValue}>{employeeData.ten_chuc_vu}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày vào làm:</Text>
            <Text style={styles.infoValue}>
              {new Date(employeeData.ngay_vao_lam).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <View style={[
              styles.statusBadge, 
              {backgroundColor: employeeData.trang_thai === 1 ? '#28a745' : '#dc3545'}
            ]}>
              <Text style={styles.statusText}>
                {employeeData.trang_thai === 1 ? 'Đang làm việc' : 'Đã nghỉ việc'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã số thuế:</Text>
            <Text style={styles.infoValue}>{employeeData.ma_so_thue}</Text>
          </View>
        </View>
      </View>
      
      {/* Rewards and Discipline Tabs */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Khen thưởng và Kỷ luật</Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'rewards' && styles.activeTab]}
            onPress={() => setActiveTab('rewards')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'rewards' && styles.activeTabText]}>
              Khen thưởng
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'discipline' && styles.activeTab]}
            onPress={() => setActiveTab('discipline')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'discipline' && styles.activeTabText]}>
              Kỷ luật
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'rewards' && (
          <View style={styles.tabContent}>
            {rewardData.length > 0 ? (
              rewardData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Mã KT:</Text>
                    <Text style={styles.tableCellValue}>{item.ma_kt}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Số QĐ:</Text>
                    <Text style={styles.tableCellValue}>{item.so_qd}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Ngày QĐ:</Text>
                    <Text style={styles.tableCellValue}>
                      {new Date(item.ngay_qd).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Tên khen thưởng:</Text>
                    <Text style={styles.tableCellValue}>{item.ten_khen_thuong}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Hình thức:</Text>
                    <Text style={styles.tableCellValue}>{item.hinh_thuc}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Số tiền:</Text>
                    <Text style={styles.tableCellValue}>
                      {parseFloat(item.so_tien).toLocaleString()} VNĐ
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Ghi chú:</Text>
                    <Text style={styles.tableCellValue}>{item.ghi_chu}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có dữ liệu khen thưởng</Text>
            )}
          </View>
        )}
        
        {activeTab === 'discipline' && (
          <View style={styles.tabContent}>
            {disciplineData.length > 0 ? (
              disciplineData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Mã KT:</Text>
                    <Text style={styles.tableCellValue}>{item.ma_kt}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Số QĐ:</Text>
                    <Text style={styles.tableCellValue}>{item.so_qd}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Ngày QĐ:</Text>
                    <Text style={styles.tableCellValue}>
                      {new Date(item.ngay_qd).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Tên kỷ luật:</Text>
                    <Text style={styles.tableCellValue}>{item.ten_khen_thuong}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Hình thức:</Text>
                    <Text style={styles.tableCellValue}>{item.hinh_thuc}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellLabel}>Ghi chú:</Text>
                    <Text style={styles.tableCellValue}>{item.ghi_chu}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có dữ liệu kỷ luật</Text>
            )}
          </View>
        )}
      </View>
      
      {/* Contracts */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hợp đồng - Phụ lục</Text>
        </View>
        
        {contractsData.length > 0 ? (
          contractsData.map((contract, index) => (
            <View key={index} style={styles.cardItem}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => toggleCard(`contract_${index}`)}
              >
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle}>{contract.ma_hop_dong}</Text>
                  <Text style={styles.cardSubtitle}>{contract.ten_hop_dong}</Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{contract.trang_thai}</Text>
                  </View>
                  <FontAwesome 
                    name={expandedCards[`contract_${index}`] ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#555" 
                    style={{marginLeft: 8}}
                  />
                </View>
              </TouchableOpacity>
              
              {expandedCards[`contract_${index}`] && (
                <View style={styles.cardContent}>
                  <View style={styles.contractInfo}>
                    <View style={styles.contractInfoColumn}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Ngày bắt đầu:</Text>
                        <Text style={styles.infoItemValue}>
                          {new Date(contract.ngay_bat_dau).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Ngày kết thúc:</Text>
                        <Text style={styles.infoItemValue}>
                          {contract.ngay_ket_thuc && contract.ngay_ket_thuc !== '0000-00-00'
                            ? new Date(contract.ngay_ket_thuc).toLocaleDateString('vi-VN')
                            : 'Không xác định'}
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Mức lương:</Text>
                        <Text style={styles.infoItemValue}>
                          {parseFloat(contract.muc_luong).toLocaleString()} VNĐ
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.contractInfoColumn}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Phụ cấp trách nhiệm:</Text>
                        <Text style={styles.infoItemValue}>
                          {parseFloat(contract.phucap_tnh).toLocaleString()} VNĐ
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Phụ cấp nghề:</Text>
                        <Text style={styles.infoItemValue}>
                          {parseFloat(contract.phucap_nghe).toLocaleString()} VNĐ
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Phụ cấp nhà trọ:</Text>
                        <Text style={styles.infoItemValue}>
                          {parseFloat(contract.phucap_nha_tro).toLocaleString()} VNĐ
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Phụ cấp đặc biệt:</Text>
                        <Text style={styles.infoItemValue}>
                          {parseFloat(contract.phucap_dac_biet).toLocaleString()} VNĐ
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có dữ liệu hợp đồng</Text>
        )}
      </View>
      
      {/* Dependents */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thông tin Người phụ thuộc</Text>
        </View>
        
        {dependentsData.length > 0 ? (
          dependentsData.map((dependent, index) => (
            <View key={index} style={styles.cardItem}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => toggleCard(`dependent_${index}`)}
              >
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle}>{dependent.ho_ten}</Text>
                  <Text style={styles.cardSubtitle}>{dependent.quan_he}</Text>
                </View>
                <FontAwesome 
                  name={expandedCards[`dependent_${index}`] ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#555" 
                />
              </TouchableOpacity>
              
              {expandedCards[`dependent_${index}`] && (
                <View style={styles.cardContent}>
                  <View style={styles.dependentInfo}>
                    <View style={styles.dependentInfoColumn}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Ngày sinh:</Text>
                        <Text style={styles.infoItemValue}>
                          {new Date(dependent.ngay_sinh).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>MST Người phụ thuộc:</Text>
                        <Text style={styles.infoItemValue}>{dependent.mst_nguoi_phu_thuoc}</Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Loại giấy tờ:</Text>
                        <Text style={styles.infoItemValue}>{dependent.loai_giay_to}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.dependentInfoColumn}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Số giấy tờ:</Text>
                        <Text style={styles.infoItemValue}>{dependent.so_giay_to}</Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Ngày bắt đầu:</Text>
                        <Text style={styles.infoItemValue}>
                          {new Date(dependent.start_time).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoItemLabel}>Ngày kết thúc:</Text>
                        <Text style={styles.infoItemValue}>
                          {dependent.end_time
                            ? new Date(dependent.end_time).toLocaleDateString('vi-VN')
                            : 'Không xác định'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có dữ liệu người phụ thuộc</Text>
        )}
      </View>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  employeeId: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  infoContainer: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    flex: 1,
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    flex: 1.5,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    backgroundColor: '#28a745',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
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
  sectionHeader: {
    backgroundColor: '#3c8dbc',
    padding: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3c8dbc',
  },
  tabButtonText: {
    color: '#777',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3c8dbc',
  },
  tabContent: {
    padding: 10,
  },
  tableRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  tableCellLabel: {
    flex: 1,
    fontWeight: '500',
    color: '#555',
  },
  tableCellValue: {
    flex: 2,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    padding: 15,
    color: '#777',
    fontStyle: 'italic',
  },
  cardItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  cardSubtitle: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  cardContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  contractInfo: {
    flexDirection: 'row',
  },
  contractInfoColumn: {
    flex: 1,
  },
  dependentInfo: {
    flexDirection: 'row',
  },
  dependentInfoColumn: {
    flex: 1,
  },
  infoItem: {
    marginBottom: 8,
  },
  infoItemLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  infoItemValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
});
