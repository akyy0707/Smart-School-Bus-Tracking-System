
-- Tài xế
CREATE TABLE TaiXe (
    ma_taixe INT AUTO_INCREMENT PRIMARY KEY
);

-- Xe buýt
CREATE TABLE XeBuyt (
    ma_xe INT AUTO_INCREMENT PRIMARY KEY,
    ma_taixe INT,
    FOREIGN KEY (ma_taixe) REFERENCES TaiXe(ma_taixe)
);

-- Tuyến đường
CREATE TABLE TuyenDuong (
    ma_tuyen INT AUTO_INCREMENT PRIMARY KEY
);

-- Phụ huynh
CREATE TABLE PhuHuynh (
    ma_phuhuynh INT AUTO_INCREMENT PRIMARY KEY
);

-- Học sinh
CREATE TABLE HocSinh (
    ma_hocsinh INT AUTO_INCREMENT PRIMARY KEY,
    ma_phuhuynh INT,
    FOREIGN KEY (ma_phuhuynh) REFERENCES PhuHuynh(ma_phuhuynh)
);

-- Lịch trình
CREATE TABLE LichTrinh (
    ma_lichtrinh INT AUTO_INCREMENT PRIMARY KEY,
    ma_xe INT,
    ma_tuyen INT,
    FOREIGN KEY (ma_xe) REFERENCES XeBuyt(ma_xe),
    FOREIGN KEY (ma_tuyen) REFERENCES TuyenDuong(ma_tuyen)
);

-- Nhật ký vị trí (theo dõi GPS)
CREATE TABLE NhatKyViTri (
    ma_nhatky INT AUTO_INCREMENT PRIMARY KEY,
    ma_xe INT,
    FOREIGN KEY (ma_xe) REFERENCES XeBuyt(ma_xe)
);

-- Thông báo
CREATE TABLE ThongBao (
    ma_thongbao INT AUTO_INCREMENT PRIMARY KEY,
    ma_phuhuynh INT,
    ma_xe INT,
    FOREIGN KEY (ma_phuhuynh) REFERENCES PhuHuynh(ma_phuhuynh),
    FOREIGN KEY (ma_xe) REFERENCES XeBuyt(ma_xe)
);
