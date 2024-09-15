const generarId = () => {
   return Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
 }
 
 export default generarId;