import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  Input,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import { db } from "../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import edit from "../../assets/edit.png";
import deleteIcon from "../../assets/delete.png";

const EditPages = () => {
  const [pages, setPages] = useState([]);
  const [newPageTitle, setNewPageTitle] = useState("");
  const pagesCollectionRef = collection(db, "pages");
  const [error, setError] = useState();
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingPage, setCurrentEditingPage] = useState(null);

  const handleTitleChange = (event) => {
    setNewPageTitle(event.target.value);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      pagesCollectionRef,
      (snapshot) => {
        const pagesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPages(pagesData);
      },
      (err) => {
        console.log(err);
      }
    );

    return () => unsubscribe();
  }, []);

  const uploadToDatabase = () => {
    if (!newPageTitle) setError("Add page title");
    else {
      const newPageNumber = pages.length + 1;
      const newPageName = `Page ${newPageNumber}`;

      let docData = {
        page: newPageName,
        title: newPageTitle,
      };

      const userRef = doc(db, "pages", docData.page);
      setDoc(userRef, docData, { merge: true })
        .then(() => {
          console.log("successfully updated DB");
          setPages([...pages, docData]);
          setNewPageTitle("");
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  };

  const deletePage = async (pageId) => {
    try {
      await deleteDoc(doc(db, "pages", pageId));
      setPages(pages.filter((page) => page.id !== pageId));
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  const startEditing = (page) => {
    setIsEditing(true);
    setCurrentEditingPage(page);
    setUpdatedTitle(page.title);
  };

  const handleUpdateTitleChange = (e) => {
    setUpdatedTitle(e.target.value);
  };

  const saveUpdatedTitle = async (pageId) => {
    try {
      await updateDoc(doc(db, "pages", pageId), { title: updatedTitle });
      setIsEditing(false);
      setCurrentEditingPage(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <Box
      color="white"
      mx="auto"
      mt={12}
      pt={6}
      bg="rgba(0,0,0,0.25)"
      w="100%"
      textAlign={"center"}
      borderTop={"1px solid"}
      borderTopColor="rgba(0,0,0,0.5)"
    >
      Edit Pages
      <Box
        color="white"
        mx="auto"
        pb={6}
        pt={4}
        borderBottom={"1px solid"}
        borderBottomColor="rgba(0,0,0,0.5)"
        justifyContent={"center"}
      >
        <Flex justifyContent={"center"} alignItems="center" mb={4}>
          <Input
            placeholder="Enter Page Title"
            value={newPageTitle}
            color="black"
            px={4}
            py={2}
            borderRadius={"4px"}
            onChange={handleTitleChange}
          />
        </Flex>

        <Button
          bg="rgba(0,0,0,0.5)"
          px={4}
          py={2}
          mx={2}
          borderRadius="4px"
          color="rgba(255,255,255,0.8)"
          _hover={{ backgroundColor: "green" }}
          onClick={uploadToDatabase}
        >
          Add new page
        </Button>
        {error ? (
          <>
            {" "}
            <Text color="red" fontWeight={"300"} mt={4}>
              Error: {error}
            </Text>
          </>
        ) : (
          <></>
        )}
      </Box>
      <Box bg="#141a2c" color="white" mx="auto" pt={6} pb={10}>
        <Flex maxW="400px" mx="auto" flexDir={"column"}>
          {pages.map((page) => (
            <Flex
              flexDir={"column"}
              mx="auto"
              justifyContent={"space-between"}
              my={4}
            >
              {isEditing && currentEditingPage.id === page.id ? (
                <Flex>
                  <Input
                    placeholder="Enter new title"
                    value={updatedTitle}
                    onChange={handleUpdateTitleChange}
                    color="black"
                  />
                  <Button onClick={() => saveUpdatedTitle(page.id)}>
                    Save
                  </Button>
                </Flex>
              ) : (
                <Text mr={4}>
                  {page.title} ({page.page})
                </Text>
              )}
              <Flex mx="auto" mt={2}>
                <Image
                  src={edit}
                  w="20px"
                  mx={4}
                  cursor="pointer"
                  onClick={() => startEditing(page)}
                />
                <Image
                  src={deleteIcon}
                  w="20px"
                  mx={4}
                  cursor="pointer"
                  onClick={() => deletePage(page.id)}
                />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default EditPages;
