import "./App.css";
import DropFileInput from "./components/drop-file-input/DropFileInput";
import UploadButton from "./components/upload-button/UploadButton";
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { Box, Button, Center } from "@chakra-ui/react";
import NoteBook from "./NoteBook";

function Upload() {
  const [file, setFile] = useState(null);

  const onFileChange = (files) => {
    const currentFile = files[0];
    setFile(currentFile);
    console.log(files);
  };

  const uploadToDatabase = (url) => {
    let docData = {
      mostRecentUploadURL: url,
      username: "jasondubon",
    };
    const userRef = doc(db, "users", docData.username);
    setDoc(userRef, docData, { merge: true })
      .then(() => {
        console.log("successfully updated DB");
      })
      .catch((error) => {
        console.log("errrror");
      });
  };

  const handleClick = () => {
    if (file === null) return;
    const fileRef = ref(storage, `videos/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(progress);
      },
      (error) => {
        console.log("error :(");
      },
      () => {
        console.log("success!!");
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          uploadToDatabase(downloadURL);
          console.log(downloadURL);
        });
      }
    );
  };

  return (
    <>
      <Center mt={10}>
        <Button variant="link" _hover={{ textDecoration: "underline" }}>
          Go to scrapbook 📙
        </Button>
      </Center>

      <Box className="box" mt={10}>
        <h2 className="header">
          File upload <br></br>
        </h2>
        <DropFileInput onFileChange={(files) => onFileChange(files)} />
        <br></br>
        <UploadButton onClick={() => handleClick()}> </UploadButton>
      </Box>
    </>
  );
}

export default Upload;
