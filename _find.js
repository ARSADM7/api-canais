const fs=require('fs'),path=require('path');
function walk(d){let r=[];for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory()){if(['node_modules','.git','vercel','.vercel','.vscode','.github'].includes(f.name))continue;r=r.concat(walk(p));}else if(/\.(js|json|html|md)$/.test(f.name)){const c=fs.readFileSync(p,'utf8');if(/API\//.test(c))r.push(p);}}return r;}
console.log(walk('.').join('\n'));
