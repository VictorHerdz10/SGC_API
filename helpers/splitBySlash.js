const splitBySlash=(path)=> {
    const obj = path.split('/').reduce((obj, part) => {
        obj[part] = part;
        return obj;
      }, {});
    
      return Object.values(obj).join('\\');
    
  }
export default  splitBySlash;