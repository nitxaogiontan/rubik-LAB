/* Cube geometry and algorithm-to-diagram renderer.
   Sticker positions/normals are rotated using integer 90-degree transforms.
   Whole-cube rotations x/y/z are normalized into the notation frame, so the
   rendered cases keep yellow on U and green on F rather than rotating centers. */
window.RubikCube = (() => {
  const COLORS = {
    U:'#f2d33d', D:'#f6f5ef', F:'#20a36f', B:'#2775c7', R:'#df4b55', L:'#f18a3b'
  };
  const FACE_BY_NORMAL = {
    '0,1,0':'U','0,-1,0':'D','0,0,1':'F','0,0,-1':'B','1,0,0':'R','-1,0,0':'L'
  };
  const FACE_NAMES = {U:'UP',D:'DOWN',F:'FRONT',B:'BACK',R:'RIGHT',L:'LEFT'};
  const NET = {U:[3,0],L:[0,3],F:[3,3],R:[6,3],B:[9,3],D:[3,6]};

  const cloneVec = v => [v[0],v[1],v[2]];
  const neg = v => [-v[0],-v[1],-v[2]];
  function rotateVector(v, axis, quarter) {
    let [x,y,z] = v;
    const q = ((quarter % 4) + 4) % 4;
    for (let i=0;i<q;i++) {
      if (axis===0) [x,y,z] = [x,-z,y];
      else if (axis===1) [x,y,z] = [z,y,-x];
      else [x,y,z] = [-y,x,z];
    }
    return [x,y,z];
  }
  function solvedCube() {
    const stickers=[];
    for (let x=-1;x<=1;x++) for (let y=-1;y<=1;y++) for (let z=-1;z<=1;z++) {
      if (x===0 && y===0 && z===0) continue;
      if (x===1) stickers.push({p:[x,y,z],n:[1,0,0],c:'R'});
      if (x===-1) stickers.push({p:[x,y,z],n:[-1,0,0],c:'L'});
      if (y===1) stickers.push({p:[x,y,z],n:[0,1,0],c:'U'});
      if (y===-1) stickers.push({p:[x,y,z],n:[0,-1,0],c:'D'});
      if (z===1) stickers.push({p:[x,y,z],n:[0,0,1],c:'F'});
      if (z===-1) stickers.push({p:[x,y,z],n:[0,0,-1],c:'B'});
    }
    return stickers;
  }
  const copyCube = cube => cube.map(s=>({p:cloneVec(s.p),n:cloneVec(s.n),c:s.c}));
  const frameInitial = () => ({R:[1,0,0],U:[0,1,0],F:[0,0,1]});
  function faceNormal(face, frame) {
    switch(face) {
      case 'R': case 'r': return cloneVec(frame.R);
      case 'L': case 'l': return neg(frame.R);
      case 'U': case 'u': return cloneVec(frame.U);
      case 'D': case 'd': return neg(frame.U);
      case 'F': case 'f': return cloneVec(frame.F);
      case 'B': case 'b': return neg(frame.F);
      default: return null;
    }
  }
  function axisAndSign(vector) {
    const axis=vector.findIndex(v=>v!==0);
    return {axis,sign:vector[axis]};
  }
  function parseTokens(alg) {
    const tokens=String(alg||'').trim().split(/\s+/).filter(Boolean);
    const valid=/^([URFDLBMESurfdlbxyz])(?:2'?|')?$/;
    for (const t of tokens) if (!valid.test(t)) throw new Error(`Ký hiệu chưa hỗ trợ: ${t}`);
    return tokens;
  }
  function resolveAlgorithm(alg) {
    const frame=frameInitial();
    const moves=[];
    const tokens=parseTokens(alg);
    for (const token of tokens) {
      const base=token[0];
      const suffix=token.slice(1);
      const amount=suffix.includes('2')?2:(suffix.includes("'")?-1:1);
      if (base==='x'||base==='y'||base==='z') {
        const key=base==='x'?'R':base==='y'?'U':'F';
        const axisVector=cloneVec(frame[key]);
        const {axis,sign}=axisAndSign(axisVector);
        const q=sign*amount; // notation frame is the inverse of the physical whole-cube rotation.
        frame.R=rotateVector(frame.R,axis,q);
        frame.U=rotateVector(frame.U,axis,q);
        frame.F=rotateVector(frame.F,axis,q);
        continue;
      }
      let normal;
      let layers;
      if (base==='M') { normal=neg(frame.R); layers=[0]; }
      else if (base==='E') { normal=neg(frame.U); layers=[0]; }
      else if (base==='S') { normal=cloneVec(frame.F); layers=[0]; }
      else {
        normal=faceNormal(base,frame);
        const {sign}=axisAndSign(normal);
        layers=[sign];
        if (base===base.toLowerCase()) layers.push(0);
      }
      const {axis,sign}=axisAndSign(normal);
      const q=-sign*amount;
      moves.push({axis,layers:[...new Set(layers)],q,token});
    }
    return moves;
  }
  function applyOneMove(cube, move) {
    const step=move.q<0?-1:1;
    const turns=Math.abs(move.q);
    for (let turn=0;turn<turns;turn++) {
      for (const sticker of cube) {
        // Center caps remain fixed relative to the cube frame in face/slice turns.
        const centerPiece=Math.abs(sticker.p[0])+Math.abs(sticker.p[1])+Math.abs(sticker.p[2])===1;
        if (centerPiece) continue;
        if (!move.layers.includes(sticker.p[move.axis])) continue;
        sticker.p=rotateVector(sticker.p,move.axis,step);
        sticker.n=rotateVector(sticker.n,move.axis,step);
      }
    }
    return cube;
  }
  function applyMoves(cube,moves) {
    const next=copyCube(cube);
    for (const move of moves) applyOneMove(next,move);
    return next;
  }
  const invertMoves = moves => moves.slice().reverse().map(m=>({...m,q:-m.q}));
  function movesToAlg(moves) {
    return moves.map(m=>{
      const p=m.layers.includes(1), n=m.layers.includes(-1), mid=m.layers.includes(0);
      let base,defaultQ;
      if (mid && (p||n)) {
        if (m.axis===0) {base=p?'r':'l';defaultQ=p?-1:1;}
        else if (m.axis===1) {base=p?'u':'d';defaultQ=p?-1:1;}
        else {base=p?'f':'b';defaultQ=p?-1:1;}
      } else if (mid) {
        base=m.axis===0?'M':m.axis===1?'E':'S';
        defaultQ=m.axis===2?-1:1;
      } else {
        const sign=p?1:-1;
        base=m.axis===0?(sign>0?'R':'L'):m.axis===1?(sign>0?'U':'D'):(sign>0?'F':'B');
        defaultQ=-sign;
      }
      let suffix='';
      if (Math.abs(m.q)===2) suffix='2';
      else if (Math.sign(m.q)!==defaultQ) suffix="'";
      return base+suffix;
    }).join(' ');
  }
  function makeCase(alg) {
    const resolved=resolveAlgorithm(alg);
    // Whole-cube regrips (x/y/z) are absorbed into the fixed diagram frame.
    // Re-label playback moves with the equivalent fixed-frame notation so the
    // move chip always describes the layer actually animated in the SVG.
    const normalizedAlg=movesToAlg(resolved);
    const normalizedTokens=parseTokens(normalizedAlg);
    const moves=resolved.map((move,index)=>({...move,token:normalizedTokens[index] || move.token}));
    const inverse=invertMoves(moves);
    const start=applyMoves(solvedCube(),inverse);
    return {moves,inverse,start,setupAlg:movesToAlg(inverse),normalizedAlg};
  }
  function stickerCell(sticker) {
    const [x,y,z]=sticker.p, [nx,ny,nz]=sticker.n;
    const face=FACE_BY_NORMAL[`${nx},${ny},${nz}`];
    let col,row;
    if (face==='U') {col=x+1;row=z+1;}
    else if (face==='D') {col=x+1;row=1-z;}
    else if (face==='F') {col=x+1;row=1-y;}
    else if (face==='B') {col=1-x;row=1-y;}
    else if (face==='R') {col=1-z;row=1-y;}
    else {col=z+1;row=1-y;}
    return {face,col,row,color:COLORS[sticker.c],letter:sticker.c};
  }
  function renderNet(cube, options={}) {
    const cell=options.cell||17, pad=options.pad??4, gap=2, labels=options.labels!==false;
    const faceW=cell*3, faceH=cell*3;
    const width=faceW*4+gap*3+pad*2;
    const height=faceH*3+gap*2+pad*2+(labels?14:0);
    const offset={};
    for(const [f,[fx,fy]] of Object.entries(NET)) offset[f]=[pad+fx*(cell+gap),pad+(labels?14:0)+fy*(cell+gap)];
    const cells=cube.map(stickerCell);
    let svg=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Sơ đồ khối Rubik được dựng từ công thức" xmlns="http://www.w3.org/2000/svg">`;
    svg+=`<rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#10151f"/>`;
    for(const face of ['U','L','F','R','B','D']) {
      const [ox,oy]=offset[face];
      if(labels) svg+=`<text x="${ox+faceW/2}" y="${oy-3}" text-anchor="middle" fill="#8491a5" font-size="8" font-family="Arial" font-weight="700">${face}</text>`;
      for(let r=0;r<3;r++) for(let c=0;c<3;c++) {
        const item=cells.find(s=>s.face===face&&s.row===r&&s.col===c);
        const fill=item?item.color:'#252b36';
        svg+=`<rect x="${ox+c*cell}" y="${oy+r*cell}" width="${cell-1}" height="${cell-1}" rx="${Math.max(2,cell*.13)}" fill="${fill}" stroke="#090d13" stroke-width="1.2"/>`;
      }
    }
    svg+='</svg>';
    return svg;
  }
  function renderCube3D(cube, options={}) {
    const size = Math.max(64, Number(options.size) || 220);
    const half = size / 2;
    const gap = Math.max(2, Math.round(size * 0.018));
    const pad = Math.max(3, Math.round(size * 0.022));
    const cells = cube.map(stickerCell);
    const faces = ['U','D','F','B','R','L'];
    const faceMarkup = faces.map(face => {
      const byPosition = new Map(cells.filter(s => s.face === face).map(s => [`${s.row},${s.col}`, s]));
      const stickers = Array.from({length:9}, (_, index) => {
        const row = Math.floor(index / 3), col = index % 3;
        const sticker = byPosition.get(`${row},${col}`);
        const color = sticker ? sticker.color : '#202833';
        return `<i class="rubik-sticker" style="--sticker-color:${color}" aria-label="${face} ${row+1}-${col+1}"></i>`;
      }).join('');
      const name = ({U:'up',D:'down',F:'front',B:'back',R:'right',L:'left'})[face];
      return `<div class="rubik-face rubik-face-${name}" data-face="${face}" aria-label="Mặt ${face}">${stickers}</div>`;
    }).join('');
    return `<div class="rubik-cube-3d" style="--cube-size:${size}px;--cube-half:${half}px;--cube-gap:${gap}px;--cube-pad:${pad}px" role="img" aria-label="Khối Rubik 3D đủ sáu mặt, màu được dựng từ trạng thái case">${faceMarkup}</div>`;
  }
  function renderTopPreview(alg,cell=14) {
    const {start}=makeCase(alg);
    return renderNet(start,{cell,pad:3,labels:true});
  }
  function validateCase(item) {
    try {
      const c=makeCase(item.alg);
      const after=applyMoves(c.start,c.moves);
      const solved=solvedCube();
      const key=s=>`${s.p.join(',')}|${s.n.join(',')}|${s.c}`;
      const expected=new Set(solved.map(key));
      const actual=new Set(after.map(key));
      const returnsSolved=expected.size===actual.size&&[...expected].every(k=>actual.has(k));
      const start=c.start.map(stickerCell);
      const centerColor=face=> {
        const item=start.find(s=>s.face===face&&s.row===1&&s.col===1);
        return item?.letter;
      };
      const centers={U:centerColor('U'),D:centerColor('D'),F:centerColor('F'),R:centerColor('R'),B:centerColor('B'),L:centerColor('L')};
      return {ok:returnsSolved,centers,setupAlg:c.setupAlg,normalizedAlg:c.normalizedAlg};
    } catch(e) { return {ok:false,error:e.message}; }
  }
  return {COLORS,solvedCube,resolveAlgorithm,applyMoves,invertMoves,makeCase,renderNet,renderCube3D,renderTopPreview,validateCase,movesToAlg};
})();
