import { ridgePts } from '../../../../visual/muste/paper.js';
for (const [h,seed,lam,sx,x0,x1] of [[22,11,48,0.105,-30,100],[40,7,90,0.046,-60,200],[52,3,170,0.0263,-100,400]]) {
  const p = ridgePts(x0,x1,h,seed,{lambda:lam,n:400}).map(q=>q[1]);
  console.log(h, Math.min(...p).toFixed(2), Math.max(...p).toFixed(2), (p.reduce((a,b)=>a+b)/p.length).toFixed(2));
}
