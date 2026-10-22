/* =========================================================
   THÀNH TÍCH & CẢM NHẬN HỌC VIÊN — Tiếng Trung Diệu Kỳ
   Thêm kết quả mới: thêm 1 dòng vào THANH_TICH (ảnh đặt trong assets/img/thanh-tich/).
   Thêm cảm nhận mới: thêm 1 dòng vào CAM_NHAN. Tên học viên ghi dạng viết tắt.
   noiBat: true  → được hiện ở trang chủ.
   ========================================================= */
(function () {
  /* ===== KẾT NỐI GOOGLE SHEET (cảm nhận học viên tự gửi) =====
     Dán link Web app của Google Apps Script vào giữa hai dấu nháy bên dưới.
     Để trống thì nút "Gửi cảm nhận" vẫn hiện nhưng báo chưa kết nối. */
  var LINK_GOOGLE_SHEET = 'https://script.google.com/macros/s/AKfycbw1QtldpM3OXIE2IQqpomhbitUTD09GDwa2n361i5sym7orU3cB-V2YrNIIsijmEagL/exec';

  var src = document.currentScript.src;
  var ROOT = src.substring(0, src.indexOf('assets/js/hoc-vien.js'));
  var IMG = ROOT + 'assets/img/thanh-tich/';

  // ---------- KẾT QUẢ THI (mới nhất ở trên) ----------
  var THANH_TICH = [
    { anh: 'tt-22.jpg', cap: 'HSK 4', diem: 277, tren: 300, ngay: '09/2026', chiTiet: 'Nghe 98 · Đọc 98 · Viết 81' },
    { anh: 'tt-01.jpg', cap: 'HSK 4', diem: 229, tren: 300, ngay: '04/2026', chiTiet: 'Nghe 84 · Đọc 78 · Viết 67' },
    { anh: 'tt-18.jpg', cap: 'HSK 5', diem: 270, tren: 300, ngay: '04/2026', chiTiet: 'Kèm HSKK Cao cấp 71/100' },
    { anh: 'tt-03.jpg', cap: 'HSK 4', diem: 281, tren: 300, ngay: '03/2026', chiTiet: 'Nghe 95 · Đọc 96 · Viết 90', noiBat: true },
    { anh: 'tt-05.jpg', cap: 'HSK 5', diem: 258, tren: 300, ngay: '03/2026', chiTiet: 'Nghe 84 · Đọc 89 · Viết 85' },
    { anh: 'tt-04.jpg', cap: 'HSK 5', diem: 249, tren: 300, ngay: '03/2026', chiTiet: 'Nghe 87 · Đọc 80 · Viết 82' },
    { anh: 'tt-02.jpg', cap: 'HSK 4', diem: 212, tren: 300, ngay: '03/2026', chiTiet: 'Nghe 70 · Đọc 86 · Viết 56' },
    { anh: 'tt-07.jpg', cap: 'HSK 3', diem: 286, tren: 300, ngay: '01/2026', chiTiet: 'Nghe 100 · Đọc 90 · Viết 96', noiBat: true },
    { anh: 'tt-06.jpg', cap: 'HSK 4', diem: 282, tren: 300, ngay: '01/2026', chiTiet: 'Nghe 100 · Đọc 96 · Viết 86 · kèm HSKK Trung cấp 74', noiBat: true },
    { anh: 'tt-08.jpg', cap: 'HSK 4', diem: 235, tren: 300, ngay: '12/2025', chiTiet: 'Nghe 84 · Đọc 83 · Viết 68 · kèm HSKK 70' },
    { anh: 'tt-09.jpg', cap: 'HSK 3', diem: 296, tren: 300, ngay: '05/2025', chiTiet: 'Nghe 100 · Đọc 100 · Viết 96 · kèm HSKK Sơ cấp 80', noiBat: true },
    { anh: 'tt-10.jpg', cap: 'HSK 4', diem: 234, tren: 300, ngay: '01/2025', chiTiet: 'Cùng học viên với kết quả 181 điểm: tăng 53 điểm sau 2 tháng' },
    { anh: 'tt-11.jpg', cap: 'HSK 4', diem: 181, tren: 300, ngay: '11/2024', chiTiet: 'Lần thi đầu, 2 tháng sau đạt 234 điểm' },
    { anh: 'tt-12.jpg', cap: 'HSK 3', diem: 263, tren: 300, ngay: '10/2024', chiTiet: 'Nghe 95 · Đọc 100 · Viết 68' },
    { anh: 'tt-13.jpg', cap: 'HSK 5', diem: 276, tren: 300, ngay: '10/2024', chiTiet: 'Nghe 99 · Đọc 93 · Viết 84 · kèm HSKK Cao cấp 70' },
    { anh: 'tt-14.jpg', cap: 'HSK 5', diem: 284, tren: 300, ngay: '01/2023', chiTiet: 'Nghe 100 · Đọc 100 · Viết 84', noiBat: true },
    { anh: 'tt-15.jpg', cap: 'HSK 4', diem: 225, tren: 300, ngay: '07/2022', chiTiet: 'Nghe 86 · Đọc 80 · Viết 59' },
    { anh: 'tt-16.jpg', cap: 'HSK 4', diem: 198, tren: 300, ngay: '06/2022', chiTiet: 'Nghe 71 · Đọc 66 · Viết 61' },
    { anh: 'tt-20.jpg', cap: 'HSK 4', diem: 280, tren: 300, ngay: '02/2022', chiTiet: 'Nghe 95 · Đọc 95 · Viết 90', noiBat: true },
    { anh: 'tt-19.jpg', cap: 'HSK 5', diem: 195, tren: 300, ngay: '02/2022', chiTiet: 'Thi cùng ngày với HSK 4 đạt 280 điểm' },
    { anh: 'tt-17.jpg', cap: 'HSK 2', diem: 194, tren: 200, ngay: '02/2022', chiTiet: 'Nghe 94 · Đọc 100' },
    { anh: 'tt-21.jpg', cap: 'HSK 4', diem: 245, tren: 300, ngay: '01/2022', chiTiet: 'Nghe 87 · Đọc 78 · Viết 80' }
  ];

  // ---------- CẢM NHẬN (đã lược bớt, "…" là chỗ lược) ----------
  var MOLII = 'Đánh giá trên trang Tiếng Trung Molii FM';
  var CAM_NHAN = [
    { ten: 'V.T. Hoài', lop: 'Khóa HSK 1 – HSK 3', nguon: 'Zalo', noiBat: true,
      loi: 'Qua 26 buổi học, cô Nhiên rất tỉ mỉ trong việc xây dựng nội dung bài giảng, kiến thức trong bài không chỉ có trong sách mà còn được cô mở rộng thêm. Trong giai đoạn 2 tuần học phát âm, cô sửa lỗi chỗ mình rất kỹ về thanh 4, cách ngắt câu đến giọng điệu… Ngoài ra cô còn chỉnh sửa tỉ mỉ giúp mình phần ngữ pháp và chữ Hán. Trong buổi học, cô còn tăng cường khả năng nói bằng cách chia nhóm nói trên lớp và về nhà luyện tập theo các chủ đề đã học. Nói chung khoá học của cô Nhiên là lựa chọn tốt cho những bạn muốn chắc nền tảng cơ bản. (Note: cô Nhiên khá là nghiêm khắc nên bạn nào đang tìm một người luôn kèm cặp và nhắc nhở thì xin mời về team cô Nhiên)' },
    { ten: 'P.U. Nguyen', lop: 'Khóa tiếng Trung giao tiếp', nguon: MOLII, noiBat: true,
      loi: 'Nhiều khi lựa chọn 1 khóa học, mình chỉ hi vọng đạt được 80% kỳ vọng là tốt rồi, nhưng học Cô rồi thì mới thấy thế nào gọi là đỉnh của đỉnh. Cô nói và dạy hay như người bản xứ vậy. Kiến thức rất sâu rộng và chắc chắn. Học Cô thì mọi người sẽ được sửa sai từng chút, từng chút một, rất tỉ mỉ… Cô luôn dạy học viên đến quá giờ, về nhà thì phản hồi học viên online rất nhanh, chữa bài cực kỳ kỹ càng.' },
    { ten: 'T. Hằng', lop: 'Lớp khẩu ngữ HSKK 1-1', nguon: MOLII, noiBat: true,
      loi: 'Cô Nguyễn Hà Nhiên đối với mình thì hơi khó tính một chút, nhưng sự khó tính đó giúp bản thân mình trưởng thành và học được rất nhiều điều hơn. Mỗi giờ học với cô đều cảm thấy rất vui vẻ, đối với một đứa nhiều thiếu sót như mình, cô luôn nhẫn nại chữa từng lỗi phát âm, có hôm dù đã qua giờ học nhưng cô vẫn cố gắng sửa hết bài cho mình rồi mới nghỉ.' },
    { ten: 'K. Ngọc', lop: 'Học viên lớp cô Nhiên', nguon: 'Zalo',
      loi: 'Khi em có những lỗi phát âm sai, từ những lỗi nhỏ nhất như thanh điệu, âm hay vận mẫu, cô đều sửa cho em rất kĩ, cho đến cả những bài ngữ pháp khó. Khi em làm chưa tốt thì cô sẽ tìm cách khắc phục, ví dụ dành nguyên 1 buổi để ôn luyện về bài đó, hay tìm giáo trình mới để phù hợp với trình độ của em hơn… Tóm lại, em thấy khóa học của cô Nhiên là 1 lựa chọn tốt và hữu ích.' },
    { ten: 'V.T. Hoa', lop: 'Học từ con số 0', nguon: 'Facebook',
      loi: 'Từng là một người không biết gì về tiếng Trung… Và rồi giờ đây tôi lại yêu thích học tiếng Trung một cách điên cuồng. Cày ngày cày đêm cùng với cô Nguyễn Hà Nhiên… Tưởng chừng như bản thân đã đọc đúng rồi nhưng cô giáo vẫn kiên trì chỉnh cho từng chút một. Điều mà tôi thích nhất là cuối mỗi tiết học cô sẽ vấn đáp nhanh 1–2 câu cho từng bạn theo từng chủ đề khác nhau để gợi nhớ từ vựng đã học, đồng thời cũng là tập phản xạ cho mọi người.' },
    { ten: 'T.U. Vũ', lop: 'Học viên lớp cô Nhiên', nguon: 'Zalo',
      loi: 'Học tiếng Trung không khó khi gặp đúng người thầy có tâm – cô giáo Nguyễn Hà Nhiên. Cô rất cẩn thận và tỉ mỉ trong việc làm slide bài giảng và luôn tạo điều kiện cho học sinh tập nói tiếng Trung trong giờ học bằng cách trả lời cô theo phản xạ… Chữa bài tập về nhà: bài viết, bài nói rất cẩn thận, nhiệt tình từ phát âm đến chữ viết từng li từng tí.' },
    { ten: 'N.T. Vân Anh', lop: 'Học từ những nét chữ đầu tiên', nguon: 'Messenger',
      loi: 'Cô Nhiên là cô giáo dạy tôi tiếng Trung từ những nét chữ đầu tiên. Giáo án, bài giảng, slide các bài đều được cô soạn rất chỉn chu. Đặc biệt phần chữ Hán có minh hoạ hình động tô nét nên khi viết tôi có thể dễ dàng bắt chước thứ tự các nét mà không bị rối… Chữa phát âm, chữa dịch câu, ngữ pháp rất kĩ luôn ạ. Phần nghe nói cô sẽ cho ghép nhóm và luyện tập xây dựng hội thoại với nhau.' },
    { ten: 'H. Đặng', lop: 'Học viên lâu năm', nguon: 'Facebook',
      loi: 'Về cách thức giảng dạy của cô thì 10 điểm không có nhưng 🤩. Các slide trong bài giảng của cô đều đa dạng và phong phú nên rất dễ tiếp thu và không bị nhàm chán. Bài tập về nhà thì… phải ghi âm và học thật kĩ nha, vì cô sẽ không bỏ sót 1 lỗi phát âm hay nét chữ nào đâu 🙏 Kết thúc bài giảng cô đều hỏi: có vướng mắc hay cần nhắc lại gì không.' },
    { ten: 'T. Hồ', lop: 'Khóa tiếng Trung giao tiếp', nguon: MOLII,
      loi: 'Cô giáo Nguyễn Hà Nhiên của mình sửa lỗi phát âm cho mình rất kỹ càng, từng âm đơn, đến giọng điệu khi nói cả câu, cả đoạn. Có những từ mình biết rồi, cứ tưởng phát âm đúng, nhưng hóa ra vẫn sai :))) Cô sửa bài viết của mình cũng rất kỹ từng dấu câu, ngữ pháp và quan trọng là cách diễn đạt theo hệ người Trung, chứ không chơi hệ người Việt dịch từng từ 哈哈。' },
    { ten: 'D. Luong', lop: 'Lớp học trực tuyến', nguon: 'Zalo',
      loi: 'Cô sửa lỗi phát âm rất tỉ mỉ. Trên lớp truyền đạt dễ hiểu, đặc biệt rất dễ nhớ ạ. Các buổi tuy học trực tuyến nhưng cô luôn chỉn chu bài giảng tới kiến thức và ôn luyện lồng ghép trong chính bài dạy. Nên một người bận như em vẫn có thể theo kịp các bài học. Tóm lại 10 điểm ạ.' },
    { ten: 'Bao', lop: 'Học viên lớp cô Nhiên', nguon: 'Zalo',
      loi: 'Cô giáo dạy cực kì dễ hiểu, có tâm và rất nhiệt tình. Cách tiếp cận kiến thức dễ nhớ, dễ thuộc bài. Giáo trình bám sát kiến thức và đi theo lộ trình ôn tập rõ ràng, cụ thể. Ngoài ra nhiều buổi cô dạy quá giờ nữa, siêu nhiệt tình giải đáp thắc mắc của học sinh bất kể ngày đêm 😂' },
    { ten: 'P. Liễu', lop: 'Lớp online', nguon: MOLII,
      loi: 'Cô Nhiên trong buổi học dạy rất nhiệt tình, chi tiết, chỉnh sửa cho mình từng thanh mẫu, vận mẫu, từng từ mình phát âm sai sao cho đúng, hơn nữa cô còn mở rộng thêm rất nhiều kiến thức bên ngoài nữa, mỗi buổi học cùng cô đều trôi qua rất vui… Sau mỗi buổi học đều có bài tập và cô chữa cũng rất chi tiết, chỉ rõ từng phần từng âm mà mình sai.' },
    { ten: 'V.T. Vũ', lop: 'Lớp 1:1, lần đầu học tiếng Trung', nguon: MOLII,
      loi: 'Đây là lần đầu mình học tiếng Trung nên trước đó mình cũng khá lo lắng. Nhưng khi đăng kí khóa học 1:1 cùng với sự giúp đỡ của cô Hà Nhiên, mình bắt đầu cảm thấy hứng thú với ngôn ngữ này hơn. Cô quan tâm đến mình hết sức tận tình và tỉ mỉ khiến bản thân mình cảm nhận được rõ sự tiến bộ sau mỗi buổi học. Việc được chỉnh sửa chi tiết và cặn kẽ về phát âm hay cách viết đã khiến mình tự tin hơn khi tiếp xúc với tiếng Trung.' },
    { ten: 'H. Hương', lop: 'Lớp sơ cấp', nguon: MOLII,
      loi: 'Lớp của mình là lớp sơ cấp và mình siêu ấn tượng với cô Nguyễn Hà Nhiên, cô là GVCN lớp mình. Cô rất đáng yêu luôn ấy 🥺, bên cạnh việc giảng dạy tiếng Trung cô còn hay nói chuyện và chia sẻ với lớp rất nhiều điều, khiến không khí của lớp học sôi nổi hẳn và khiến mình cảm thấy càng ngày càng đam mê tiếng Trung hơn 💓' },
    { ten: 'N. Hạ', lop: 'Học viên lớp cô Nhiên', nguon: MOLII,
      loi: 'Cô giảng dạy rất nhiệt tình, chỉnh phát âm rất kĩ, dễ hiểu, giọng cực hay và đặc biệt là rất có tâm luôn ý ạ. Hết giờ rồi mà vẫn dành thời gian để hướng dẫn và trả lời những thắc mắc của em. Mỗi buổi học Cô luôn tràn đầy năng lượng tích cực và làm em cảm thấy thêm yêu tiếng Trung hơn nữa.' },
    { ten: 'H. Chu', lop: 'Người đi làm, sửa phát âm', nguon: MOLII,
      loi: 'Mình đã có căn bản về tiếng Trung do làm việc với người Trung mấy năm, nhưng phát âm chuẩn và trau chuốt câu từ thì chưa có nên đã có cơ hội học cô Hà Nhiên. Cô sửa phát âm khá kĩ (mặc dù mình thuộc diện khó sửa vì đã nói chuyện mấy năm thành quen), thấy cô khá có tâm, hài hước khiến buổi học tuy xa mà gần, không còn khô khan.' },
    { ten: 'B. Trâm', lop: 'Lớp khẩu ngữ', nguon: MOLII,
      loi: 'Mình đặc biệt thích cô Hà Nhiên dạy khẩu ngữ. Ở 1 nhóm khẩu ngữ khác mà cứ nằng nặc đòi đổi lớp để được học cô vì cô dạy rất hay, chỉnh sửa phát âm quá là tỉ mỉ.' },
    { ten: 'N.V. Xuân', lop: 'Lớp 42 buổi', nguon: MOLII,
      loi: 'Thực ra ban đầu mình cũng rất e ngại khi chỉ đăng kí lớp 24 buổi. Sau đó mình cảm thấy khả năng truyền đạt và sự tận tình, chu đáo trong giảng dạy của cô giáo Hà Nhiên phụ trách, mình đã quyết định đăng kí lớp 42 buổi.' },
    { ten: 'L.P.M. Linh', lop: 'Lớp 1-1, mới bắt đầu', nguon: MOLII,
      loi: 'Đối với người chưa bao giờ tiếp xúc với tiếng Trung như mình thì mình đã rất lo lắng để có thể học thêm một ngoại ngữ mới. Nhưng khi đến với lớp học 1-1 của cô Nguyễn Hà Nhiên, mình thấy cô rất tận tâm với học sinh… Cô chỉnh sửa phát âm rất kĩ để mình có thể hoàn thiện hơn cũng như trả lời các câu hỏi mà mình thắc mắc.' },
    { ten: 'N. Kimchi', lop: 'Lớp 1:1, mẹ bỉm vừa học', nguon: MOLII,
      loi: 'Do bận con cái gia đình nên không đến trung tâm học được, chỉ tự học ở nhà nhưng phát âm không chuẩn… Cô giáo rất nhiệt tình, sửa phát âm rất kĩ và bây giờ phát âm của mình cũng tốt hơn xưa nhiều rồi. Cô giáo Nguyễn Hà Nhiên sửa phát âm rất nhiệt tình nhé.' },
    { ten: 'B.H. Yến', lop: 'Lớp sơ cấp 2', nguon: MOLII,
      loi: 'Đặc biệt là tiết học với cô Nhiên mình thấy rất thoải mái và dễ hiểu, cô sửa cho mình rất kỹ càng, tỉ mỉ về phần phát âm, ngữ pháp cũng như bài tập về nhà luôn ạ. Tuy là học online nhưng mình thấy rất hiệu quả.' },
    { ten: 'L. Nhím', lop: 'Học viên lớp cô Nhiên', nguon: MOLII,
      loi: 'Cô cực kì nhiệt tình, quan tâm học viên. Cô giảng dạy ngữ pháp và chữa bài tập cho các học viên chi tiết lắm luôn. Dù kiến thức mới hay kiến thức cũ thì có cơ hội là Cô sẽ nhắc lại cho học viên đỡ quên.' },
    { ten: 'M.H. Tiên', lop: 'Lớp online', nguon: MOLII,
      loi: 'Tuy là học online nhưng mình rất hiểu bài và có rất nhiều năng lượng tích cực học tập. Cô có thể giải đáp tất cả các thắc mắc của mình, bổ sung tất cả các kiến thức mà mình còn thiếu sót và rất tận tâm chỉ dạy học sinh.' },
    { ten: 'A. Hi', lop: 'Lớp online 1-1', nguon: MOLII,
      loi: 'Mình học lớp online 1-1 cô Nhiên, cô chu đáo và giảng dạy nhiệt tình. Giọng mình ảnh hưởng vùng miền nên phát âm sai rất nhiều, có cô chỉ dẫn và sửa tận tình lắm nè.' },
    { ten: 'H. Nguyễn', lop: 'Lớp 1:1 online', nguon: MOLII,
      loi: 'Tôi được học cô Nguyễn Hà Nhiên, cô dễ tính, vui vẻ & cách dạy của cô rất kĩ lưỡng, rõ ràng, kĩ năng dạy rất tốt, dễ hiểu. Tôi cảm thấy rất dễ chịu & thoải mái khi học cô Nhiên.' },
    { ten: 'H. Be', lop: 'Lớp khẩu ngữ cuối tuần', nguon: MOLII,
      loi: 'Lớp khẩu ngữ cuối tuần… mình yếu về phát âm, cô Hà Nhiên chỉ mình từng chút sai ở đâu, phát âm sao cho chuẩn, bài tập mình làm sai cô dành thời gian chỉ cho mình các lỗi sai.' },
    { ten: 'D. Ngô', lop: 'Lớp khẩu ngữ cuối tuần', nguon: MOLII,
      loi: 'Đặc biệt là lớp học khẩu ngữ cuối tuần của cô Hà Nhiên, tiết học rất sôi nổi, cũng rất vui vẻ. Quan trọng là được cô sửa phát âm và quan tâm tận tình ạ 🥰' },
    { ten: 'N. Mai', lop: 'Lớp 1-1, vừa đi làm vừa học', nguon: MOLII,
      loi: 'Về chất lượng giáo viên thì oke la, cô giáo có năng lực ngôn ngữ sư phạm tốt, biết cách truyền tải thông tin cho học sinh làm sao dễ hiểu nhất. Tính cách thì nhiệt tình, tập trung.' },
    { ten: 'V. Ngọc', lop: 'Lớp 1:1', nguon: MOLII,
      loi: 'Mình đã đăng ký học lớp 1:1 với cô Nguyễn Hà Nhiên. Cô giáo rất thân thiện và nhiệt tình, chuyên môn cũng rất tốt.' },
    { ten: 'J. Mi', lop: 'Lớp sơ cấp HSK 3', nguon: MOLII,
      loi: 'Cô Hà Nhiên (GVCN lớp sơ cấp HSK3) tận tình giúp em sửa bài tập và lỗi phát âm, mặc dù em luôn gửi bài muộn…' },
    { ten: 'T. Phương', lop: 'Lớp online', nguon: MOLII,
      loi: 'Cô dạy rất hay, dễ hiểu, tận tâm và vui tính. Tuy học online nhưng mình cảm thấy không có chút cản trở và sự nản chí nào.' },
    { ten: 'J. Hyun', lop: 'Học viên lớp cô Nhiên', nguon: MOLII,
      loi: 'Vô tình gặp được cô Nguyễn Hà Nhiên mà em càng thêm yêu tiếng Trung hơn. Cách dạy cô rất hay, giọng cực kỳ chuẩn. Ngữ pháp cô dạy thì khỏi phải bàn, càng học càng cuốn.' },
    { ten: 'T. Thí', lop: 'Buổi khẩu ngữ', nguon: MOLII,
      loi: 'Mình đã tham gia buổi khẩu ngữ với cô Hà Nhiên, cô giảng rất kỹ, chi tiết, nhiệt tình, chỉnh sửa chỗ sai giúp mình cải thiện tốt hơn.' },
    { ten: 'T.T. Ngan', lop: 'Lớp sơ cấp', nguon: MOLII,
      loi: 'Riêng cô Hà Nhiên đặc biệt hơn xíu là cô chữa bài tập về nhà rất kĩ.' },
    { ten: 'Đ. Ngoan', lop: 'Học tiếp khóa thứ hai', nguon: MOLII,
      loi: 'Mình đã học 1 khóa và bây giờ đang học khóa thứ hai, mình cảm thấy được sự tận tâm giảng dạy của cô Nguyễn Hà Nhiên, giáo viên chủ nhiệm.' },
    { ten: 'N. Nguyen', lop: 'Lớp sơ cấp online', nguon: MOLII,
      loi: 'Mình đang theo học lớp sơ cấp online của cô Hà Nhiên. Trải qua thời gian học vừa qua mình thấy rất hài lòng về chất lượng cũng như sự nhiệt tình của cô.' },
    { ten: 'N.A. Nguyen', lop: 'Lớp sơ cấp', nguon: MOLII,
      loi: 'Cô hướng dẫn rất nhiệt tình, tận tâm, cảm thấy rất thích học với cô. Tin tưởng sẽ học được rất nhiều trong khoá học này 🙂' },
    { ten: 'T. Nguyễn', lop: 'Lớp 1:1 online', nguon: MOLII,
      loi: 'Mình học 1:1 online với cô Nguyễn Hà Nhiên, cô giảng dễ hiểu, giọng hay và nhiệt tình 😍' }
  ];

  // ================= HIỂN THỊ =================
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function theDiem(t, i) {
    return '<button class="tt-card" type="button" data-i="' + i + '">' +
      '<span class="tt-img"><img src="' + IMG + t.anh + '" alt="Kết quả ' + esc(t.cap) + ' ' + t.diem + '/' + t.tren + '" loading="lazy"></span>' +
      '<span class="tt-info"><span class="tt-top"><b>' + esc(t.cap) + '</b><span class="tt-date">' + t.ngay + '</span></span>' +
      '<span class="tt-score">' + t.diem + '<small>/' + t.tren + '</small></span>' +
      '<span class="tt-detail">' + esc(t.chiTiet) + '</span></span></button>';
  }

  function theCamNhan(c) {
    var chu = c.ten.replace(/[^A-Za-zÀ-ỹĐđ]/g, '').charAt(0) || '学';
    return '<figure class="cn-card"><div class="cn-quote">“</div>' +
      (c.sao ? '<div class="cn-stars" aria-label="' + c.sao + ' trên 5 sao">' + '★★★★★'.slice(0, c.sao) + '<span>' + '★★★★★'.slice(c.sao) + '</span></div>' : '') +
      '<blockquote>' + esc(c.loi) + '</blockquote>' +
      (c.anh && c.anh.length ? '<div class="cn-anh">' + c.anh.map(function (u) {
        return '<button type="button" class="cn-anh-i" data-src="' + esc(u) + '"><img src="' + esc(u) + '" alt="Ảnh học viên gửi kèm" loading="lazy" referrerpolicy="no-referrer"></button>'; }).join('') + '</div>' : '') +
      '<figcaption><span class="cn-ava">' + esc(chu) + '</span><span><b>' + esc(c.ten) + '</b>' +
      '<small>' + esc(c.lop) + '</small><em>' + esc(c.nguon) + '</em></span></figcaption></figure>';
  }

  function thongKe() {
    var cao = THANH_TICH.reduce(function (m, t) { return t.tren === 300 && t.diem > m ? t.diem : m; }, 0);
    var tram = THANH_TICH.filter(function (t) { return /(Nghe|Đọc) 100/.test(t.chiTiet); }).length;
    return '<div class="hv-stats">' +
      '<div><b>' + THANH_TICH.length + '</b><span>kết quả thi HSK, HSKK</span></div>' +
      '<div><b>' + cao + '<small>/300</small></b><span>điểm cao nhất</span></div>' +
      '<div><b>' + tram + '</b><span>bài thi có kỹ năng đạt 100/100</span></div>' +
      '<div><b>' + CAM_NHAN.length + '</b><span>cảm nhận của học viên</span></div></div>';
  }

  // Lightbox xem ảnh to
  var box;
  var DS_XEM = THANH_TICH;
  function moAnh(i, ds) {
    DS_XEM = ds || THANH_TICH;
    if (!box) {
      box = document.createElement('div'); box.className = 'tt-box';
      box.innerHTML = '<button class="tt-x" type="button" aria-label="Đóng">✕</button><button class="tt-nav prev" type="button" aria-label="Trước">‹</button>' +
        '<figure><img alt=""><figcaption></figcaption></figure><button class="tt-nav next" type="button" aria-label="Sau">›</button>';
      document.body.appendChild(box);
      box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('tt-x')) box.classList.remove('on'); });
      box.querySelector('.prev').onclick = function () { hien(box._i - 1); };
      box.querySelector('.next').onclick = function () { hien(box._i + 1); };
      document.addEventListener('keydown', function (e) {
        if (!box.classList.contains('on')) return;
        if (e.key === 'Escape') box.classList.remove('on');
        if (e.key === 'ArrowLeft') hien(box._i - 1);
        if (e.key === 'ArrowRight') hien(box._i + 1);
      });
    }
    hien(i); box.classList.add('on');
  }
  function hien(i) {
    var n = DS_XEM.length; i = (i + n) % n; box._i = i; var t = DS_XEM[i];
    box.querySelector('img').src = IMG + t.anh;
    box.querySelector('figcaption').innerHTML = '<b>' + esc(t.cap) + ' · ' + t.diem + '/' + t.tren + '</b> · ' + t.ngay + '<br>' + esc(t.chiTiet);
  }
  function ganAnh(el, list) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.tt-card'); if (b) moAnh(+b.dataset.i, list);
    });
  }

  // Trang Giới thiệu: đầy đủ
  // 5 thành tích hiện sẵn: kết quả mới nhất + các kết quả nổi bật; còn lại nằm trong "Xem thêm"
  var SO_HIEN = 5;
  var noiBat = THANH_TICH.filter(function (t) { return t.noiBat; }).sort(function (a, b) { return b.diem - a.diem; });
  var moiNhat = THANH_TICH[0];
  var dauTien = [moiNhat].concat(noiBat.filter(function (t) { return t !== moiNhat; })).slice(0, SO_HIEN);
  var conLai = THANH_TICH.filter(function (t) { return dauTien.indexOf(t) < 0; });
  var THU_TU = dauTien.concat(conLai);

  var elTT = document.getElementById('hv-thanh-tich');
  var veTT = function () {};
  if (elTT) {
    var moTT = false;
    veTT = function () {
      var ds = moTT ? THU_TU : dauTien;
      elTT.innerHTML = thongKe() + '<div class="tt-grid">' + ds.map(theDiem).join('') + '</div>' +
        '<div class="cn-more"><button class="btn" type="button">' + (moTT ? 'Thu gọn' : 'Xem thêm ' + conLai.length + ' kết quả') + '</button></div>';
      elTT.querySelector('.cn-more button').onclick = function () {
        moTT = !moTT; veTT(); if (!moTT) elTT.scrollIntoView({ behavior: 'smooth' });
      };
      elTT._ds = ds;
    };
    veTT();
    elTT.addEventListener('click', function (e) {
      var b = e.target.closest('.tt-card'); if (b) moAnh(THU_TU.indexOf(elTT._ds[+b.dataset.i]), THU_TU);
    });
  }
  var elCN = document.getElementById('hv-cam-nhan');
  var veCN = function () {};
  if (elCN) {
    var SO = 9, dangMo = false;
    veCN = function () {
      var ds = dangMo ? CAM_NHAN : CAM_NHAN.slice(0, SO);
      elCN.innerHTML = '<div class="cn-grid">' + ds.map(theCamNhan).join('') + '</div>' +
        '<div class="cn-more">' +
          (CAM_NHAN.length > SO ? '<button class="btn" type="button" data-act="more">' + (dangMo ? 'Thu gọn' : 'Xem thêm ' + (CAM_NHAN.length - SO) + ' cảm nhận') + '</button> ' : '') +
          '<button class="btn gold" type="button" data-act="gui">✍️ Gửi cảm nhận của bạn</button></div>';
      var m = elCN.querySelector('[data-act=more]');
      if (m) m.onclick = function () { dangMo = !dangMo; veCN(); if (!dangMo) elCN.scrollIntoView({ behavior: 'smooth' }); };
      elCN.querySelector('[data-act=gui]').onclick = moForm;
    };
    veCN();
  }

  // Trang chủ: rút gọn
  var elHome = document.getElementById('hv-trang-chu');
  var veHome = function () {};
  if (elHome) {
    var tt = dauTien;
    veHome = function () {
      var cn = CAM_NHAN.filter(function (c) { return c.noiBat; });
      elHome.innerHTML = thongKe() +
        '<div class="tt-grid compact">' + tt.map(theDiem).join('') + '</div>' +
        '<div class="cn-grid three">' + cn.map(theCamNhan).join('') + '</div>' +
        '<div class="cn-more"><a class="btn solid" href="' + ROOT + 'gioi-thieu.html#thanh-tich">Xem tất cả thành tích & cảm nhận →</a> ' +
        '<a class="btn gold" href="' + ROOT + 'gioi-thieu.html#gui-cam-nhan">✍️ Gửi cảm nhận của bạn</a></div>';
    };
    veHome();
    ganAnh(elHome, tt);
  }

  // ================= CẢM NHẬN ĐÃ DUYỆT TỪ GOOGLE SHEET =================
  if (LINK_GOOGLE_SHEET && (elCN || elHome || elTT)) {
    fetch(LINK_GOOGLE_SHEET + (LINK_GOOGLE_SHEET.indexOf('?') < 0 ? '?' : '&') + 'xem=1&t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.length) return;
        var moi = data.map(function (d) {
          return { ten: 'Học viên', lop: 'Học viên của cô Nhiên', nguon: 'Gửi qua website · ' + d.ngay, loi: d.loi, sao: +d.sao || 0, anh: d.anh || [] };
        });
        CAM_NHAN = moi.concat(CAM_NHAN);
        veCN(); veTT(); veHome();
      })
      .catch(function () { /* lỗi mạng: giữ nguyên các cảm nhận có sẵn */ });
  }

  // ================= Ô GỬI CẢM NHẬN =================
  var form;
  function moForm() {
    if (!form) {
      form = document.createElement('div'); form.className = 'gf-box';
      form.innerHTML =
        '<form class="gf" novalidate>' +
          '<button class="gf-x" type="button" aria-label="Đóng">✕</button>' +
          '<div class="sec-kicker">写评价</div><h3>Gửi cảm nhận của bạn</h3>' +
          '<div class="gf-l">Bạn chấm mấy sao?</div>' +
          '<div class="gf-stars" role="radiogroup">' + [1, 2, 3, 4, 5].map(function (n) {
            return '<button type="button" data-sao="' + n + '" role="radio" aria-label="' + n + ' sao">★</button>'; }).join('') +
            '<span class="gf-star-txt"></span></div>' +
          '<label>Cảm nhận của bạn<textarea name="loi" rows="5" maxlength="1500" required placeholder="Học cùng cô, bạn thấy thế nào?"></textarea></label>' +
          '<div class="gf-anh"><div class="gf-anh-list"></div>' +
            '<label class="gf-anh-them">📷 Thêm ảnh <small>(tối đa 3 ảnh)</small><input type="file" accept="image/*" multiple hidden></label></div>' +
          '<input class="gf-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="gf-note">Cảm nhận sẽ hiện trên web sau khi cô Hà Nhiên đọc và duyệt.</p>' +
          '<div class="gf-err" role="alert"></div>' +
          '<button class="btn solid gf-send" type="submit">Gửi cảm nhận</button>' +
        '</form>' +
        '<div class="gf gf-ok" hidden><div class="gf-ok-ico">💚</div><h3>Cảm ơn bạn rất nhiều!</h3>' +
          '<p>Cô Hà Nhiên đã nhận được cảm nhận của bạn. Cảm nhận sẽ xuất hiện trên web sau khi cô duyệt nhé.</p>' +
          '<button class="btn solid" type="button" data-dong>Đóng</button></div>';
      document.body.appendChild(form);
      var f = form.querySelector('form'), sao = 0, NHAN = ['', 'Chưa hài lòng', 'Tạm được', 'Khá tốt', 'Rất tốt', 'Tuyệt vời!'];
      var stars = form.querySelectorAll('.gf-stars button');
      // ----- Ảnh đính kèm: thu nhỏ trước khi gửi cho nhẹ -----
      var ANH = [], TOI_DA = 3;
      var oAnh = form.querySelector('.gf-anh-list'), nutThem = form.querySelector('.gf-anh-them'), chonAnh = nutThem.querySelector('input');
      function veAnh() {
        oAnh.innerHTML = ANH.map(function (a, k) {
          return '<span class="gf-anh-i"><img src="data:image/jpeg;base64,' + a + '" alt=""><button type="button" data-k="' + k + '" aria-label="Bỏ ảnh">✕</button></span>'; }).join('');
        nutThem.style.display = ANH.length >= TOI_DA ? 'none' : '';
      }
      oAnh.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { ANH.splice(+b.dataset.k, 1); veAnh(); } });
      function thuNho(file) {
        return new Promise(function (ok, hong) {
          var r = new FileReader();
          r.onload = function () {
            var im = new Image();
            im.onload = function () {
              var max = 1280, w = im.width, h = im.height, k = Math.min(1, max / Math.max(w, h));
              var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
              var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
              ok(c.toDataURL('image/jpeg', 0.82).split(',')[1]);
            };
            im.onerror = hong; im.src = r.result;
          };
          r.onerror = hong; r.readAsDataURL(file);
        });
      }
      chonAnh.addEventListener('change', function () {
        var ds = Array.prototype.slice.call(chonAnh.files).filter(function (f) { return /^image\//.test(f.type); }).slice(0, TOI_DA - ANH.length);
        chonAnh.value = '';
        Promise.all(ds.map(thuNho)).then(function (kq) { ANH = ANH.concat(kq).slice(0, TOI_DA); veAnh(); })
          .catch(function () { form.querySelector('.gf-err').textContent = 'Có ảnh không mở được, bạn chọn ảnh khác nhé.'; });
      });
      function toSao(n) {
        stars.forEach(function (s, k) { s.classList.toggle('on', k < n); s.setAttribute('aria-checked', k === n - 1); });
        form.querySelector('.gf-star-txt').textContent = NHAN[n] || '';
      }
      stars.forEach(function (s) {
        s.onclick = function () { sao = +s.dataset.sao; toSao(sao); };
        s.onmouseenter = function () { toSao(+s.dataset.sao); };
        s.onmouseleave = function () { toSao(sao); };
      });
      function dong() { form.classList.remove('on'); }
      form.addEventListener('click', function (e) { if (e.target === form || e.target.closest('.gf-x,[data-dong]')) dong(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dong(); });
      f.onsubmit = function (e) {
        e.preventDefault();
        var loi = '', err = form.querySelector('.gf-err');
        if (!sao) loi = 'Bạn chọn số sao giúp cô nhé.';
        else if (f.loi.value.trim().length < 10) loi = 'Bạn viết thêm vài chữ nữa nhé.';
        else if (!LINK_GOOGLE_SHEET) loi = 'Mục gửi cảm nhận chưa được kết nối. Bạn nhắn Zalo cho cô giúp nhé!';
        err.textContent = loi; if (loi) return;
        if (f.website.value) return; // máy spam
        var nut = f.querySelector('.gf-send'); nut.disabled = true; nut.textContent = 'Đang gửi…';
        var body = JSON.stringify({ sao: sao, loi: f.loi.value.trim(), anh: ANH, website: f.website.value });
        if (ANH.length) nut.textContent = 'Đang gửi ảnh…';
        function xong() {
          f.hidden = true; form.querySelector('.gf-ok').hidden = false;
          f.reset(); sao = 0; toSao(0); ANH = []; veAnh(); nut.disabled = false; nut.textContent = 'Gửi cảm nhận';
        }
        function hong() { nut.disabled = false; nut.textContent = 'Gửi cảm nhận'; err.textContent = 'Chưa gửi được, bạn kiểm tra mạng rồi thử lại nhé.'; }
        fetch(LINK_GOOGLE_SHEET, { method: 'POST', body: body })
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d && d.ok) xong(); else { hong(); if (d && d.loi) err.textContent = d.loi; } })
          .catch(function () {
            // Một số trình duyệt chặn đọc phản hồi: gửi lại kiểu "không cần phản hồi"
            fetch(LINK_GOOGLE_SHEET, { method: 'POST', mode: 'no-cors', body: body }).then(xong).catch(hong);
          });
      };
    }
    form.querySelector('form').hidden = false; form.querySelector('.gf-ok').hidden = true;
    form.querySelector('.gf-err').textContent = '';
    form.classList.add('on');
  }
  if (elCN && location.hash === '#gui-cam-nhan') {
    setTimeout(function () { elCN.scrollIntoView(); moForm(); }, 300);
  }
  // Bấm ảnh trong cảm nhận để xem to
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.cn-anh-i'); if (!b) return;
    var o = document.createElement('div'); o.className = 'cn-anh-big';
    o.innerHTML = '<img src="' + b.dataset.src + '" alt="" referrerpolicy="no-referrer">';
    o.onclick = function () { o.remove(); }; document.body.appendChild(o);
  });
})();
