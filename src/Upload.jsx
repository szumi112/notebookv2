import "./App.css";
import DropFileInput from "./components/drop-file-input/DropFileInput";
import UploadButton from "./components/upload-button/UploadButton";
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { Box, Button, Center, Input, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import EditPages from "./components/edit-pages";

function Upload() {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState();
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const onFileChange = (files) => {
    const currentFile = files[0];
    setFile(currentFile);
    console.log(files);
  };

  const uploadToDatabase = (url) => {
    let docData = {
      mostRecentUploadURL: url,
    };
    const userRef = doc(
      db,
      "users",
      `${pageNumber}_${
        Date.now().toString(36) + Math.random().toString(36).substr(2)
      }`
    );
    setDoc(userRef, docData, { merge: true })
      .then(() => {
        console.log("successfully updated DB");
      })
      .catch((error) => {
        console.log("errrror");
      });
  };

  const handleClick = () => {
    if (!pageNumber) {
      setErrorMessage("Please choose which page to add this onto");
      return;
    }
    if (file === null) return;
    const fileName = `page${pageNumber}_${file.name}`;
    const fileRef = ref(storage, `videos/${fileName}`);
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
    setErrorMessage("");
  };

  return (
    <Box bg="#141a2c" m="0" p="0" minH="100vh" minW="100vw" overflowX="hidden">
      <Center pt={10}>
        <Button
          variant="outline"
          color="white"
          _hover={{ textDecoration: "underline" }}
          onClick={() => navigate("/")}
        >
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
      <Box mt={12}>
        <Text textAlign={"center"} color="white" mb={4}>
          Add on page:
        </Text>
        <Center>
          <Input
            type="number"
            value={pageNumber}
            px={4}
            py={2}
            borderRadius={"4px"}
            onChange={(e) => setPageNumber(e.target.value)}
            placeholder="Page number"
          />
        </Center>
      </Box>
      {errorMessage && (
        <Text textAlign={"center"} color="red" mb={4} mt={2}>
          {errorMessage}
        </Text>
      )}
      <EditPages />
    </Box>
  );
}

export default Upload;
