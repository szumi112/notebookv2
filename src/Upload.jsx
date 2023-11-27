import "./App.css";
import DropFileInput from "./components/drop-file-input/DropFileInput";
import UploadButton from "./components/upload-button/UploadButton";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "./firebase";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
  Switch,
  TabList,
  TabPanel,
  Tabs,
  Tab,
  TabPanels,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import EditPages from "./components/edit-pages";

function Upload() {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState();
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState("");
  const [uploadType, setUploadType] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");

  const renderUploadTypeSelection = () => (
    <Center mt={10} color="white">
      <Button
        bgColor="rgba(255,255,255,0.1)"
        px="4"
        pt={2}
        pb="3"
        borderRadius="6"
        border="1px solid"
        borderColor="rgba(255,255,255,0.25)"
        _hover={{
          borderColor: "rgba(255,255,255,0.5)",
          bgColor: "rgba(255,255,255,0.25)",
        }}
        mr={4}
        onClick={() => setUploadType("file")}
      >
        Upload Image/Video
      </Button>
      <Button
        bgColor="rgba(255,255,255,0.1)"
        px="4"
        pt={2}
        pb="3"
        borderRadius="6"
        border="1px solid"
        borderColor="rgba(255,255,255,0.25)"
        _hover={{
          borderColor: "rgba(255,255,255,0.5)",
          bgColor: "rgba(255,255,255,0.25)",
        }}
        onClick={() => setUploadType("text")}
      >
        Upload Text
      </Button>
    </Center>
  );

  const renderUploadInput = () => {
    if (uploadType === "file") {
      return (
        <Box className="box" mt={10}>
          <DropFileInput onFileChange={(files) => onFileChange(files)} />
          <br />
          <UploadButton onClick={() => handleClick()}>Upload File</UploadButton>
        </Box>
      );
    } else if (uploadType === "text") {
      return (
        <Center mx="auto">
          <FormControl>
            <FormLabel
              htmlFor="text"
              color="white"
              mb={7}
              mt={4}
              textAlign={"center"}
              fontWeight={"500"}
              fontSize="24px"
            >
              Text input field
            </FormLabel>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text here"
              w="100%"
              minW="300px"
              mx="auto"
              p={2}
            />
            <Center mt={4}>
              <UploadButton onClick={() => handleClick()}>
                Upload File
              </UploadButton>
            </Center>
          </FormControl>
        </Center>
      );
    }
  };

  const renderSwitchOption = () => (
    <Center mt={10} color="white">
      <Button
        onClick={() => setUploadType(null)}
        bgColor="rgba(255,255,255,0.1)"
        px="4"
        pt={2}
        pb="3"
        borderRadius="6"
        border="1px solid"
        borderColor="rgba(255,255,255,0.25)"
        _hover={{
          borderColor: "rgba(255,255,255,0.5)",
          bgColor: "rgba(255,255,255,0.25)",
        }}
      >
        Switch Upload Type
      </Button>
    </Center>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const editorModeDoc = doc(db, "EditorMode", "editMode");
        const docSnap = await getDoc(editorModeDoc);
        if (docSnap.exists()) {
          setEditMode(docSnap.data().enabled);
        }
      } catch (error) {
        console.error("Error fetching editor mode:", error);
      }
    };

    fetchData();
  }, []);

  const toggleEditMode = async () => {
    try {
      const editorModeDoc = doc(db, "EditorMode", "editMode");
      await setDoc(editorModeDoc, { enabled: !editMode });
      setEditMode((prevEditMode) => !prevEditMode);
    } catch (error) {
      console.error("Error toggling editor mode:", error);
    }
  };

  const onFileChange = (files) => {
    const currentFile = files[0];
    setFile(currentFile);
    console.log(files);
  };

  const uploadToDatabase = (url) => {
    const itemId = `${pageNumber}_${
      Date.now().toString(36) + Math.random().toString(36).substr(2)
    }`;
    let docData = {
      id: itemId,
      mostRecentUploadURL: url,
    };
    const userRef = doc(db, "users", itemId);
    setDoc(userRef, docData, { merge: true })
      .then(() => {
        console.log("successfully updated DB");
      })
      .catch((error) => {
        console.log("errrror");
      });
  };

  const handleClick = () => {
    const parsedPageNumber = parseInt(pageNumber, 10);

    if (!parsedPageNumber || isNaN(parsedPageNumber)) {
      setErrorMessage("Please choose a valid page number");
      return;
    }

    setErrorMessage("");

    if (!pageNumber) {
      setErrorMessage("Please choose which page to add this onto");
      return;
    }

    if (text) {
      const itemId = `${pageNumber}_${
        Date.now().toString(36) + Math.random().toString(36).substr(2)
      }`;
      let docData = {
        id: itemId,
        text: text,
        type: "text",
        mostRecentUploadURL: text,
      };
      const userRef = doc(db, "users", itemId);
      setDoc(userRef, docData, { merge: true });
      setText("");
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

  useEffect(() => {
    if (pageNumber) {
      setErrorMessage("");
    }
  }, [pageNumber]);

  return (
    <Box bg="#141a2c" m="0" p="0" minH="100vh" minW="100vw" overflowX="hidden">
      <Center pt={10} flexDir={"column"}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              marginBottom: "8px",
            }}
          >
            <label htmlFor="edit-mode" style={{ marginRight: "8px" }}>
              Edit Mode:
            </label>
            <div
              style={{
                display: "inline-block",
                width: "40px",
                height: "20px",
                backgroundColor: editMode ? "cyan" : "gray",
                borderRadius: "10px",
                position: "relative",
                cursor: "pointer",
              }}
              onClick={toggleEditMode}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "1px",
                  left: editMode ? "21px" : "1px",
                  transition: "left 0.2s",
                }}
              ></div>
            </div>
            <span style={{ marginLeft: "8px" }}>{editMode ? "On" : "Off"}</span>
          </div>
        </div>
        <Button
          mt={10}
          variant="outline"
          color="white"
          _hover={{ textDecoration: "underline" }}
          onClick={() => navigate("/")}
        >
          Go to scrapbook 📙
        </Button>
      </Center>
      <Tabs
        index={activeTabIndex}
        onChange={setActiveTabIndex}
        color="white"
        mt={10}
      >
        <Center>
          <TabList>
            <Tab
              mr={4}
              h="40px"
              w="125px"
              bg="rgba(55,150,200,0.25)"
              borderRadius={6}
              border={activeTabIndex === 0 ? "1px solid blue" : "none"}
              _hover={{
                backgroundColor: "rgba(55,150,200,0.55)",
              }}
            >
              Upload Files
            </Tab>
            <Tab
              ml={4}
              h="40px"
              w="125px"
              bg="rgba(55,150,200,0.25)"
              borderRadius={6}
              border={activeTabIndex === 1 ? "1px solid blue" : "none"}
              _hover={{
                backgroundColor: "rgba(55,150,200,0.55)",
              }}
            >
              Manage Pages
            </Tab>
          </TabList>
        </Center>
        <TabPanels>
          <TabPanel>
            {activeTab === "upload" && (
              <>
                {!uploadType && renderUploadTypeSelection()}
                {uploadType && (
                  <>
                    {renderUploadInput()}
                    {renderSwitchOption()}
                  </>
                )}
                {uploadType && (
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
                    {errorMessage && (
                      <Text textAlign={"center"} color="red" mb={4} mt={2}>
                        {errorMessage}
                      </Text>
                    )}
                  </Box>
                )}
              </>
            )}
          </TabPanel>
          <TabPanel>
            <EditPages />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default Upload;
