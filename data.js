/* RUBIK LAB — CFOP data pack
   Reference conventions: yellow U, white D, green F, red R, blue B, orange L.
   F2L: cross on D, target slot at front-right. OLL/PLL: first two layers solved, yellow U.
*/
window.RUBIK_DATA = (() => {
  const F2L = [
    ['01','White up · edge left/front','Both on top · white up','U2 R U R\' U R U\' R\''],
    ['02','White up · edge back/right','Both on top · white up','F\' L\' U2 L F'],
    ['03','White up · edge back/front','Both on top · white up','U R U2 R\' U R U\' R\''],
    ['04','White up · edge left/right','Both on top · white up','y U\' L\' U2 L U\' L\' U L'],
    ['05','White up · edge front/front','Both on top · white up','U F R\' F\' R U R U R\''],
    ['06','White up · edge right/right','Both on top · white up','F U R U\' R\' F\' R U\' R\''],
    ['07','White up · edge right/front','Both on top · white up','R U2 R\' U\' R U R\''],
    ['08','White up · edge front/right','Both on top · white up','y L\' U2 L U L\' U\' L'],
    ['09','Right up · edge back/front','Both on top · white on side','R U R\''],
    ['10','Front up · edge left/right','Both on top · white on side','y L\' U\' L'],
    ['11','Right up · edge left/front','Both on top · white on side','U\' R U R\' U R U R\''],
    ['12','Front up · edge back/right','Both on top · white on side','y U L\' U\' L U\' L\' U\' L'],
    ['13','Right up · edge front/front','Both on top · white on side','R\' U2 R2 U R2 U R'],
    ['14','Front up · edge right/right','Both on top · white on side','y L U2 L2 U\' L2 U\' L\''],
    ['15','Right up · edge right/front','Both on top · white on side','U\' R U\' R\' U R U R\''],
    ['16','Front up · edge front/right','Both on top · white on side','y U L\' U L U\' L\' U\' L'],
    ['17','Right up · edge front/right','Both on top · matching U stickers','y U\' L\' U L'],
    ['18','Front up · edge right/front','Both on top · matching U stickers','U R U\' R\''],
    ['19','Right up · edge back/right','Both on top · matching U stickers','r\' U2 R2 U R2 U r'],
    ['20','Front up · edge left/front','Both on top · matching U stickers','U\' R U2 R\' U2 R U\' R\''],
    ['21','Front up · edge back/front','Both on top · matching U stickers','U\' R U R\' U2 R U\' R\''],
    ['22','Right up · edge left/right','Both on top · matching U stickers','U\' r U\' R\' U R U r\''],
    ['23','Front up · edge front/front','Both on top · matching U stickers','M U L F\' L\' U\' M\''],
    ['24','Right up · edge right/right','Both on top · matching U stickers','R U\' R\' y U2 L\' U\' L'],
    ['25','Right up · edge in slot, correct','Edge already in slot','U R U R\' U2 R U R\''],
    ['26','Front up · edge in slot, correct','Edge already in slot','U\' R U\' R\' U2 R U\' R\''],
    ['27','Right up · edge in slot, flipped','Edge already in slot','U F\' U\' F U\' R U R\''],
    ['28','Front up · edge in slot, flipped','Edge already in slot','U2 R U R\' F R\' F\' R'],
    ['29','White up · edge in slot, correct','Edge already in slot','U R U\' R\' U R U\' R\' U R U\' R\''],
    ['30','White up · edge in slot, flipped','Edge already in slot','R U\' R\' F\' U2 F'],
    ['31','Corner in slot · white right','Corner already in slot','R U R\' U\' R U R\''],
    ['32','Corner in slot · white front','Corner already in slot','R\' F R F\' R\' F R F\''],
    ['33','Corner in slot · white front, edge right','Corner already in slot','R U\' R\' U R U\' R\''],
    ['34','Corner in slot · white right, edge front','Corner already in slot','y L\' U L U\' L\' U L'],
    ['35','Corner in slot · white down, edge right','Corner already in slot','R\' F\' R U R U\' R\' F'],
    ['36','Corner in slot · white down, edge front','Corner already in slot','U R U\' R\' F R\' F\' R'],
    ['37','Pair in slot · white right, edge correct','Both pieces in slot','R U\' R\' U R U2 R\' U R U\' R\''],
    ['38','Pair in slot · white front, edge correct','Both pieces in slot','R U\' R\' U\' R U R\' U2 R U\' R\''],
    ['39','Pair in slot · white right, edge flipped','Both pieces in slot','R U\' R\' F\' L\' U2 L F'],
    ['40','Pair in slot · white front, edge flipped','Both pieces in slot','F\' L\' U2 L F R U R\''],
    ['41','Pair in slot · white down, edge flipped','Both pieces in slot','R2 U2 F R2 F\' U2 R\' U R\'']
  ].map(([n,name,group,alg]) => ({
    id:`f2l-${n}`, case:`F2L ${Number(n)}`, name:`F2L ${Number(n)}`, group:'f2l', subgroup:group,
    type:'F2L', alg, hold:'Giữ dấu cộng trắng ở đáy, vàng ở trên; đặt slot cần giải ở trước-phải (FR).',
    recognition:name, stage:'Cross + F2L', twoLook:false,
    note:'Hình được dựng bằng cách đảo ngược chính thuật toán trên một cube đã giải. Nhìn vị trí góc trắng và cạnh cùng màu; không đổi hướng cầm giữa lúc nhận diện.'
  }));

  const ollRaw = [
    [26,'Edges oriented','OLL 26 · OCLL6',"R U2 R' U' R U' R'"],
    [27,'Edges oriented','OLL 27 · OCLL7',"R U R' U R U2 R'"],
    [21,'Edges oriented','OLL 21 · OCLL1',"R U2 R' U' R U R' U' R U' R'"],
    [22,'Edges oriented','OLL 22 · OCLL2',"R U2 R2 U' R2 U' R2 U2 R"],
    [24,'Edges oriented','OLL 24 · OCLL4',"r U R' U' r' F R F'"],
    [25,'Edges oriented','OLL 25 · OCLL5',"F' r U R' U' r' F R"],
    [23,'Edges oriented','OLL 23 · OCLL3',"R2 D R' U2 R D' R' U2 R'"],
    [33,'T-shapes','OLL 33 · T1',"R U R' U' R' F R F'"],
    [45,'T-shapes','OLL 45 · T2',"F R U R' U' F'"],
    [5,'Squares','OLL 5 · S1',"r' U2 R U R' U r"],
    [6,'Squares','OLL 6 · S2',"r U2 R' U' R U' r'"],
    [34,'C-shapes','OLL 34 · C1',"R U R2 U' R' F R U R U' F'"],
    [46,'C-shapes','OLL 46 · C2',"R' U' R' F R F' U R"],
    [36,'W-shapes','OLL 36 · W1',"R' U' R U' R' U R U R B' R' B"],
    [38,'W-shapes','OLL 38 · W2',"R U R' U R U' R' U' R' F R F'"],
    [28,'Corners correct · edges flipped','OLL 28 · E1',"r U R' U' M U R U' R'"],
    [57,'Corners correct · edges flipped','OLL 57 · E2',"R U R' U' M' U R U' r'"],
    [31,'P-shapes','OLL 31 · P1',"R' U' F U R U' R' F' R"],
    [32,'P-shapes','OLL 32 · P2',"S R U R' U' R' F R f'"],
    [43,'P-shapes','OLL 43 · P3',"F' U' L' U L F"],
    [44,'P-shapes','OLL 44 · P4',"F U R U' R' F'"],
    [51,'I-shapes','OLL 51 · I1',"f R U R' U' R U R' U' f'"],
    [56,'I-shapes','OLL 56 · I4',"r' U' r U' R' U R U' R' U R r' U r"],
    [52,'I-shapes','OLL 52 · I2',"R' U' R U' R' U y' R' U R B"],
    [55,'I-shapes','OLL 55 · I3',"F U' R2 D R' U2 R D' R2 U F'"],
    [9,'Fish shapes','OLL 9 · F1',"R U R' U' R' F R2 U R' U' F'"],
    [10,'Fish shapes','OLL 10 · F2',"R U R' U R' F R F' R U2 R'"],
    [35,'Fish shapes','OLL 35 · F3',"R U2 R2 F R F' R U2 R'"],
    [37,'Fish shapes','OLL 37 · F4',"F R U' R' U' R U R' F'"],
    [13,'Knight moves','OLL 13 · K1',"r U' r' U' r U r' y' R' U R"],
    [14,'Knight moves','OLL 14 · K2',"R' F R U R' F' R F U' F'"],
    [16,'Knight moves','OLL 16 · K4',"r U r' R U R' U' r U' r'"],
    [15,'Knight moves','OLL 15 · K3',"r' U' r R' U' R U r' U r"],
    [29,'Awkward shapes','OLL 29 · A1',"R U2 R2 F R F' R U' R' U R U2 R'"],
    [30,'Awkward shapes','OLL 30 · A2',"F U R U2 R' U' R U2 R' U' F'"],
    [41,'Awkward shapes','OLL 41 · A3',"R U R' U R U2 R' F R U R' U' F'"],
    [42,'Awkward shapes','OLL 42 · A4',"R' U' R U' R' U2 R F R U R' U' F'"],
    [48,'L-shapes','OLL 48 · L2',"F R U R' U' R U R' U' F'"],
    [47,'L-shapes','OLL 47 · L1',"F' L' U' L U L' U' L U F"],
    [49,'L-shapes','OLL 49 · L3',"r U' r2 U r2 U r2 U' r"],
    [50,'L-shapes','OLL 50 · L4',"r' U r2 U' r2 U' r2 U r'"],
    [53,'L-shapes','OLL 53 · L5',"r' U' R U' R' U R U' R' U2 r"],
    [54,'L-shapes','OLL 54 · L6',"r U R' U R U' R' U R U2 r'"],
    [7,'Lightning bolts','OLL 7 · B1',"r U R' U R U2 r'"],
    [8,'Lightning bolts','OLL 8 · B2',"r' U' R U' R' U2 r"],
    [11,'Lightning bolts','OLL 11 · B3',"r' R2 U R' U R U2 R' U M'"],
    [12,'Lightning bolts','OLL 12 · B4',"M' R' U' R U' R' U2 R U' M"],
    [39,'Lightning bolts','OLL 39 · B5',"L F' L' U' L U F U' L'"],
    [40,'Lightning bolts','OLL 40 · B6',"R' F R U R' U' F' U R"],
    [1,'No edges oriented','OLL 1 · O1',"R U2 R2 F R F' U2 R' F R F'"],
    [2,'No edges oriented','OLL 2 · O2',"F R U R' U' F' f R U R' U' f'"],
    [3,'No edges oriented','OLL 3 · O3',"f R U R' U' f' U' F R U R' U' F'"],
    [4,'No edges oriented','OLL 4 · O4',"f R U R' U' f' U F R U R' U' F'"],
    [18,'No edges oriented','OLL 18 · O6',"R U2 R2 F R F' U2 M' U R U' r'"],
    [19,'No edges oriented','OLL 19 · O7',"M U R U R' U' M' R' F R F'"],
    [17,'No edges oriented','OLL 17 · O5',"R U R' U R' F R F' U2 R' F R F'"],
    [20,'No edges oriented','OLL 20 · O8',"M U R U R' U' M2 U R U' r'"]
  ];
  const twoLookOll = new Set([2,21,22,23,24,25,26,27,44,45]);
  const OLL = ollRaw.map(([n,group,name,alg]) => ({
    id:`oll-${String(n).padStart(2,'0')}`, case:`OLL ${n}`, name, group:'oll', subgroup:group,
    type:'OLL', alg, hold:'Giữ vàng ở trên (U), trắng ở dưới (D), green ở trước (F). Hai tầng dưới phải được giữ nguyên.',
    recognition:`Nhận diện nhóm “${group}”; nhìn hình vàng trên mặt U và các sticker vàng ở hàng trên của bốn mặt bên.`,
    stage:'Last Layer · Orientation', twoLook:twoLookOll.has(n),
    note:'Đây là công thức OLL đầy đủ. Hình mẫu được tạo bằng cách áp dụng nghịch đảo của công thức lên cube đã giải, theo đúng hướng cầm quy ước.'
  })).sort((a,b) => Number(a.case.match(/\d+/)?.[0] || 0) - Number(b.case.match(/\d+/)?.[0] || 0));

  const pllRaw = [
    ['Aa','A Perm',"R' D R U2 R' D' R U' R' D R U' R' D' R",'Corners · adjacent'],
    ['Ab','A Perm',"x R2 D2 R U R' D2 R U' R x'",'Corners · adjacent'],
    ['E','E Perm',"R B' R' F R B R' F' R B R' F R B' R' F'",'Corners · diagonal'],
    ['F','F Perm',"R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",'Corners + edges'],
    ['Ga','G Perm',"R2 U R' U R' U' R U' R2 D U' R' U R D'",'G Perm'],
    ['Gb','G Perm',"R' U' R U D' R2 U R' U R U' R U' R2 D",'G Perm'],
    ['Gc','G Perm',"R2 U' R U' R U R' U R2 D' U R U' R' D",'G Perm'],
    ['Gd','G Perm',"R U R' U' D R2 U' R U' R' U R' U R2 D'",'G Perm'],
    ['H','H Perm',"M2 U' M2 U2 M2 U' M2",'Edges only'],
    ['Ja','J Perm',"x R2 F R F' R U2 r' U r U2 x'",'Corners + edges'],
    ['Jb','J Perm',"R U R' F' R U R' U' R' F R2 U' R'",'Corners + edges'],
    ['Na','N Perm',"R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",'Diagonal swap'],
    ['Nb','N Perm',"R' U R U' R' F' U' F R U R' F R' F' R U' R",'Diagonal swap'],
    ['Ra','R Perm',"R U' R' U' R U R D R' U' R D' R' U2 R'",'Corners + edges'],
    ['Rb','R Perm',"R' U2 R' D' R U' R' D R U R U' R' U' R",'Corners + edges'],
    ['T','T Perm',"R U R' U' R' F R2 U' R' U' R U R' F'",'Corners + edges'],
    ['Ua','U Perm',"R U' R U R U R U' R' U' R2",'Edges only'],
    ['Ub','U Perm',"R2 U R U R' U' R' U' R' U R'",'Edges only'],
    ['V','V Perm',"R' U R' U' y R' F' R2 U' R' U R' F R F",'Diagonal swap'],
    ['Y','Y Perm',"F R U' R' U' R U R' F' R U R' U' R' F R F'",'Diagonal swap'],
    ['Z','Z Perm',"M2 U' M2 U' M' U2 M2 U2 M'",'Edges only']
  ];
  const twoLookPll = new Set(['H','T','Ua','Ub','Y','Z']);
  const PLL = pllRaw.map(([caseName,group,alg,recognition]) => ({
    id:`pll-${caseName.toLowerCase()}`, case:`${caseName} Perm`, name:`${caseName} Perm`, group:'pll', subgroup:group,
    type:'PLL', alg, hold:'Giữ vàng ở trên (U), hai tầng dưới đã giải. Xoay U để căn pattern theo mô tả nhận diện.',
    recognition, stage:'Last Layer · Permutation', twoLook:twoLookPll.has(caseName),
    note:'Hình mẫu được tạo bằng cách áp dụng nghịch đảo thuật toán lên cube đã giải. Với PLL, mặt U đã vàng hoàn chỉnh; các sticker hàng trên ở bốn mặt bên cho biết hoán vị.'
  }));

  const beginner = [
    {title:'Dấu cộng trắng',goal:'Đặt bốn cạnh trắng quanh tâm trắng và khớp màu phụ với tâm bên.',how:['Tìm 4 cạnh có màu trắng. Mỗi cạnh phải khớp cả màu trắng và màu của tâm bên cạnh.','Giải trực giác; có thể đưa cạnh lên tầng U rồi căn màu bên với tâm trước khi đưa xuống.','Kiểm tra cả bốn mặt bên: màu cạnh phải thẳng hàng với tâm.'],alg:'Không có công thức cố định',tip:'Giữ tâm trắng làm mốc; đừng chỉ tạo hình dấu cộng mà bỏ qua màu thứ hai.'},
    {title:'Bốn góc trắng',goal:'Hoàn thành mặt trắng và toàn bộ tầng đầu tiên.',how:['Giữ dấu cộng trắng ở dưới, vàng ở trên.','Tìm góc trắng ở tầng U và xác định khe bằng hai màu còn lại.','Đưa góc tới UFR. Nếu sticker trắng hướng sang phải, dùng trigger tay phải; nếu hướng sang trái, dùng bản đối xứng.','Góc mắc sai dưới đáy: dùng trigger để đưa nó lên, rồi chèn lại.'],alg:"R U R' U'  ·  đối xứng: L' U' L U",tip:'Lặp nguyên trigger 4 move, không dừng giữa chuỗi. Tư thế cầm: khe mục tiêu trước-phải.'},
    {title:'Tầng giữa',goal:'Đưa bốn cạnh không có vàng vào đúng slot tầng giữa.',how:['Tìm cạnh ở tầng U không chứa màu vàng.','Xoay U để màu hướng về phía trước trùng với tâm F.','Nếu màu còn lại khớp tâm bên phải, dùng công thức chèn phải; nếu khớp bên trái, dùng công thức chèn trái.','Cạnh bị kẹt sai trong tầng giữa: dùng công thức để đẩy nó lên U rồi giải lại.'],alg:"Phải: U R U' R' U' F' U F\nTrái: U' L' U L U F U' F'",tip:'Giữ trắng ở đáy, vàng ở trên. Đừng đưa cạnh có màu vàng vào tầng giữa.'},
    {title:'Tạo dấu cộng vàng',goal:'Định hướng bốn cạnh tầng cuối để mặt U có dấu cộng vàng.',how:['Chỉ nhìn sticker vàng của bốn cạnh trên; bỏ qua góc.','Đường thẳng: đặt nằm ngang. Chữ L: đặt hai cạnh vàng ở phía sau và bên trái.','Chấm: áp dụng công thức rồi nhận diện hình mới; có thể phải lặp.'],alg:"F R U R' U' F'",tip:'Đặt pattern đúng hướng trước khi làm công thức; cùng một chuỗi nhưng cầm sai hướng có thể không tạo ra kết quả mong muốn.'},
    {title:'Đưa cạnh vàng về đúng tâm',goal:'Hoán vị bốn cạnh tầng U để màu bên trùng tâm.',how:['Xoay U và kiểm tra màu bên của từng cạnh.','Nếu có hai cạnh đúng nằm kề nhau, đặt chúng ở phía sau và bên phải rồi dùng công thức.','Nếu hai cạnh đúng đối diện nhau, làm công thức một lần, kiểm tra lại rồi đưa cặp đúng về vị trí kề nhau.'],alg:"R U R' U R U2 R'",tip:'Đây là bước hoán vị cạnh; không nhầm với dấu cộng vàng ở bước 4. Dùng U để căn chỉnh cuối bước.'},
    {title:'Đưa góc vàng về đúng vị trí',goal:'Đặt mỗi góc vào slot đúng theo ba màu, chưa cần sticker vàng hướng lên.',how:['Một góc đúng vị trí khi ba màu của nó nằm giữa đúng ba tâm tương ứng, dù sticker vàng chưa hướng lên.','Nếu có một góc đúng, giữ nó ở UFR và thực hiện công thức.','Nếu không có góc đúng, làm công thức một lần từ bất kỳ hướng nào rồi kiểm tra lại.'],alg:"U R U' L' U R' U' L",tip:'Đúng vị trí và đúng hướng là hai khái niệm khác nhau. Bước này chỉ xét vị trí.'},
    {title:'Xoay góc và hoàn tất',goal:'Xoay đúng hướng các góc còn lại rồi căn chỉnh tầng U.',how:['Giữ vàng ở trên. Đưa một góc sai hướng vào UFR.','Lặp R U R\' U\' cho tới khi sticker vàng của góc đó hướng lên.','Chỉ xoay U để đưa góc sai tiếp theo vào UFR; không xoay cả khối.','Các tầng dưới có thể trông bị xáo trộn trong lúc làm; hoàn thành đủ chuỗi cho cả bốn góc rồi căn U.'],alg:"R U R' U'  ·  lặp theo từng góc",tip:'Luôn hoàn thành đủ chuỗi 4 move cho mỗi góc. Đừng dừng ở giữa chuỗi.'}
  ];

  // Curated alternates: keep the reference algorithm as the default, and expose
  // a mnemonic option or a lower-move option only where the trade-off is clear.
  const variantsById = {
    'pll-ua': [
      {
        id:'m-slice',
        label:'Ít move · M-slice',
        alg:"M2 U M U2 M' U M2",
        note:'Bản 7 move phổ biến. Ít move hơn bản R/U, nhưng chỉ nên dùng khi m đã flick lớp M mượt; nếu M còn khựng thì bản chính dễ kiểm soát hơn.'
      }
    ],
    'pll-ub': [
      {
        id:'m-slice',
        label:'Ít move · M-slice',
        alg:"M2 U' M U2 M' U' M2",
        note:'Bản 7 move phổ biến. Tiết kiệm move nhưng cần M-slice ổn định; đừng ép dùng chỉ vì nhìn công thức ngắn hơn.'
      }
    ],
    'pll-ra': [
      {
        id:'ruf-grip',
        label:'R/U/F · ít đổi grip',
        alg:"R U R' F' R U2 R' U2 R' F R U R U2 R'",
        note:`Bản thay thế bỏ D / D' của công thức chính và giữ các move trên R/U/F. Có thể hợp tay hơn nếu m hay khựng ở move D; hãy thử chậm trước.`
      }
    ],
    'pll-rb': [
      {
        id:'ruf-grip',
        label:'R/U/F · ít đổi grip',
        alg:"R' U2 R U2 R' F R U R' U' R' F' R2",
        note:'Bản thay thế ngắn hơn một chút và không dùng D. Đoạn F là chỗ cần tập nối mượt, đừng regrip quá nhiều.'
      }
    ],
    'pll-z': [
      {
        id:'no-m-slice',
        label:'Không M-slice · R/U-only',
        alg:"R' U' R U' R U R U' R' U R U R2 U' R'",
        note:'Bản 15 move, dài hơn bản chính nhưng không cần M / M2. Hợp để học trước khi thành thạo M-slice; đừng nhầm ít ký hiệu hơn với ít move hơn.'
      }
    ]
  };

  [...OLL, ...PLL].forEach(item => {
    item.variants = variantsById[item.id] || [];
  });

  return { F2L, OLL, PLL, beginner, counts:{f2l:F2L.length,oll:OLL.length,pll:PLL.length} };
})();
