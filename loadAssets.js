// import * as fs from 'fs';
const fs = require('fs');
const path = require('path');

const importFilesToPhaser = async (folder) => {
    let dirents = await fs.readdirSync(folder, { withFileTypes: true })

    const filesNames = dirents
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name);


    filesNames.forEach((val) => {
        // console.log(val)
        let extension = path.extname(val);
        let folderPartial = "assets/" + folder.split("/assets")[1];
        // console.log(folderPartial)
        printOutFile(val, extension, folderPartial)
    } )
}

function recursivelyListDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory
        ? recursivelyListDir(dirPath, callback)
        : callback(path.join(dir, f));
    });
}



const printOutFile = async (val, extension, folderPartial) => {
    let str = "";
    let valWithoutExt = val.split('.').slice(0, -1).join('.')
    // console.log(val, extension, folderPartial)
    let assetname = valWithoutExt.replace( new RegExp('-', 'g'), '_');

    

    if (extension === ".png" || extension === ".jpg")
    {
        str = "this.load.image('"+assetname+ "', '" +folderPartial+val+"');";
    }
    else if (extension === ".xml")
    {
        str = "this.load.xml('"+assetname+ "', '" +folderPartial+val+"');";
    }
    else if (extension === ".mp3")
    {
        str = "this.load.audio('"+assetname+ "', '" +folderPartial+'/'+val+"');";
    }

    console.log(str)
}

(async () => {
    recursivelyListDir("./public/assets", function(filePath) {
        const fileContents = fs.readFileSync(filePath, "utf8");

        filePath = filePath.replace( new RegExp('\\\\', 'g') , '/');
        
        let folder = path.dirname(filePath)
        let val = path.basename(filePath);
        let extension = path.extname(val);

        // console.log(folder, folder.split("/assets"))
        let folderPartial = "" + folder.split("assets")[1]+"";

        // console.log(filePath, extension, folderPartial);

        printOutFile(val, extension, folderPartial)


      });
})();