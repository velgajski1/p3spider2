


const Ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

let basename = path.basename(__dirname)

async function uploadFolder(ftpClient, localFolder, remoteFolder) {
  // Make sure the local folder ends with a trailing slash
  if (!localFolder.endsWith('/')) {
    localFolder += '/';
  }

  // Make sure the remote folder ends with a trailing slash
  if (!remoteFolder.endsWith('/')) {
    remoteFolder += '/';
  }

  // Create the remote folder if it doesn't exist
  try {
    await ftpClient.ensureDir(remoteFolder);
  } catch (err) {
    console.error(`Error creating remote folder ${remoteFolder}:`, err);
    return;
  }

  // Get a list of files in the local folder
  const files = fs.readdirSync(localFolder);

  // Iterate over the files and upload them to the FTP server
  for (const file of files) {
    const localPath = path.join(localFolder, file);
    const remotePath = path.join(remoteFolder, file).replace(/\\/g, '/');  //

    // Check if the file is a directory
    if (fs.lstatSync(localPath).isDirectory()) {
      // Recursively upload the subfolder
      await uploadFolder(ftpClient, localPath, remotePath);
    } else {
      // Upload the file

      try {
        await ftpClient.uploadFrom(localPath, remotePath);
      } catch (err) {
        console.error(`Error uploading ${localPath} to ${remotePath}:`, err);
      }
    }
  }
}

async function main() {
  // Create an FTP client
  const ftpClient = new Ftp.Client();
  ftpClient.ftp.verbose = false;

  try {
    // Connect to the FTP server
    await ftpClient.access({
      host: '62.84.246.143',
      user: 'piyu487730',
      password: 'Tijde_Ww_23',
    });

    // Upload the local folder to the remote folder
    await uploadFolder(ftpClient, 'D:/Projects/' + basename + '/dist/', '/domains/gamestest.net/public_html/free/spider');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the FTP client
    await ftpClient.close();
  }
}

main();
