import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import HTMLFlipBook from "react-pageflip";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const NavigationButtons = ({ flipBook }) => {
  const goToPrevPage = () => {
    flipBook.current.pageFlip().flipPrev();
  };

  const goToNextPage = () => {
    flipBook.current.pageFlip().flipNext();
  };

  return (
    <Flex justifyContent="space-between" px={4} py={1}>
      <Button onClick={goToPrevPage}>Previous Page</Button>
      <Button onClick={goToNextPage}>Next Page</Button>
    </Flex>
  );
};

const Page = React.forwardRef((props, ref) => (
  <div className={`page ${props.className}`} ref={ref} data-density="hard">
    <div className="page-content">
      <h1>{props.children}</h1>
    </div>
  </div>
));

const NoteBook = () => {
  const [pages, setPages] = useState([]);
  const [uploadedItems, setUploadedItems] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [singlePage, setSinglePage] = useState(window.innerWidth < 1400);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBook = useRef();
  const [resizeMode, setResizeMode] = useState(true);
  const [dragAndDropMode, setDragAndDropMode] = useState(false);
  const [fontSizeState, setFontSizeState] = useState({});

  const increaseFontSize = (itemId) => {
    setFontSizeState((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 14) + 1,
    }));
  };

  const decreaseFontSize = (itemId) => {
    setFontSizeState((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 14) - 1, 10),
    }));
  };

  const toggleResizeMode = () => {
    setResizeMode(!resizeMode);
    if (!resizeMode) {
      setDragAndDropMode(false);
    }
  };

  const toggleDragAndDropMode = () => {
    setDragAndDropMode(!dragAndDropMode);
    if (!dragAndDropMode) {
      setResizeMode(false);
    }
  };

  useEffect(() => {
    const pagesCollectionRef = collection(db, "pages");
    const getPagesList = async () => {
      try {
        const data = await getDocs(pagesCollectionRef);
        setPages(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (err) {
        console.log(err);
      }
    };

    const getUploadedItems = async () => {
      const itemsCollectionRef = collection(db, "users");
      try {
        const data = await getDocs(itemsCollectionRef);
        const newFontSizeState = {};

        const items = data.docs.reduce((acc, doc) => {
          const itemData = doc.data();
          const pageNum = doc.id.split("_")[0];
          if (!acc[pageNum]) {
            acc[pageNum] = [];
          }
          acc[pageNum].push(itemData);

          if (itemData.type === "text" && itemData.fontSize) {
            newFontSizeState[doc.id] = itemData.fontSize;
          }

          return acc;
        }, {});

        setUploadedItems(items);
        setFontSizeState(newFontSizeState);
      } catch (error) {
        console.error("Error fetching uploaded items:", error);
      }
    };

    getPagesList();
    getUploadedItems();
  }, []);

  const onPageFlip = (e) => setCurrentPage(e.data);

  const handleResizeStop = async (item, resizeData, pageNumber) => {
    const newWidth = resizeData.size.width;
    const newHeight = resizeData.size.height;

    let newFontSize = Math.max(10, newWidth / 20);

    const updatedItem = {
      ...item,
      width: newWidth,
      height: newHeight,
      fontSize: newFontSize,
    };

    const itemRef = doc(db, "users", `${item.id}`);
    await setDoc(
      itemRef,
      { width: newWidth, height: newHeight, fontSize: newFontSize },
      { merge: true }
    );
  };

  const renderMedia = (item, pageNumber) => {
    const videoFileTypes = [
      "mp4",
      "mov",
      "avi",
      "mkv",
      "wmv",
      "avchd",
      "webm",
      "h264",
      "mpeg4",
      "flv",
      "m4v",
      "3gp",
      "ts",
      "m2ts",
      "mts",
      "divx",
      "ogv",
      "dv",
      "dat",
      "asf",
      "webm",
      "mpg",
      "mpeg",
      "mxf",
      "vob",
      "rm",
      "rmvb",
      "drc",
      "gifv",
      "mng",
      "qt",
      "yuv",
      "nsv",
      "f4v",
      "f4p",
      "f4a",
      "f4b",
    ];
    const isVideo = videoFileTypes.some((ext) =>
      item.mostRecentUploadURL.toLowerCase().includes(`.${ext}`)
    );

    let defaultWidth = 200;
    let defaultHeight = 200;

    const resizableClassName = editMode
      ? "resizable-active"
      : "resizable-inactive";

    const resizableProps = {
      width: item.width || defaultWidth,
      height: item.height || defaultHeight,
      onResizeStop: (event, resizeData) =>
        handleResizeStop(item, resizeData, pageNumber),
      disabled: !resizeMode || !editMode,
      className: resizableClassName,
    };

    const fontSize = fontSizeState[item.id] || 14;

    return (
      <Box zIndex={1}>
        <ResizableBox {...resizableProps}>
          {item.type === "text" ? (
            <Text
              style={{
                width: "100%",
                height: "100%",
                fontSize: `${fontSize}px`,
              }}
            >
              {item.text}
            </Text>
          ) : isVideo ? (
            <video controls style={{ width: "100%", height: "100%" }}>
              <source src={item.mostRecentUploadURL} />
            </video>
          ) : (
            <Image
              src={item.mostRecentUploadURL}
              alt="Uploaded content"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </ResizableBox>
        {item.type === "text" && editMode && (
          <Flex justifyContent="center">
            <Button onClick={() => decreaseFontSize(item.id)}>-</Button>
            <Button onClick={() => increaseFontSize(item.id)}>+</Button>
          </Flex>
        )}
      </Box>
    );
  };

  useEffect(() => {
    const handleEditModeChange = (snapshot) => {
      if (snapshot.exists()) {
        setEditMode(snapshot.data().enabled);
      }
    };

    const editorModeDoc = doc(db, "EditorMode", "editMode");
    const unsubscribe = onSnapshot(editorModeDoc, handleEditModeChange);

    return () => unsubscribe();
  }, []);

  const handleDragStop = async (item, e, data) => {
    const newX = data.x;
    const newY = data.y;

    const itemIdParts = item.id.split("_");
    if (itemIdParts.length < 2) {
      console.error("Invalid item id format:", item.id);
      return;
    }
    const pageNumber = itemIdParts[0];
    const actualItemId = itemIdParts.slice(1).join("_");

    const itemRef = doc(db, "users", `${pageNumber}_${actualItemId}`);
    await setDoc(itemRef, { x: newX, y: newY }, { merge: true });
  };

  return (
    <Box overflow="hidden" data-density="hard" bgColor={"white"}>
      <HTMLFlipBook
        width={singlePage ? size.width : size.width / 2}
        height={size.height * 2.5}
        {...(!singlePage && { size: "stretch" })}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        flippingMode="hard"
        onFlip={onPageFlip}
        ref={flipBook}
        drawShadow={!singlePage}
        useMouseEvents={!editMode}
      >
        {pages.map((page, index) => {
          const pageNumber = page.id.replace("page ", "");
          const items = uploadedItems[pageNumber] ?? [];

          return (
            <Page
              key={page.id}
              className={index === 0 ? "wooden-background" : ""}
            >
              <Text>{page.title}</Text>
              <div>
                {items.map((item, idx) => {
                  const element = renderMedia(item, pageNumber);

                  return (
                    <Draggable
                      key={idx}
                      onStop={(e, data) =>
                        handleDragStop(item, e, data, pageNumber)
                      }
                      defaultPosition={{ x: item.x || 0, y: item.y || 0 }}
                      disabled={!dragAndDropMode}
                    >
                      <Box w="100%" h="100%">
                        {element}
                      </Box>
                    </Draggable>
                  );
                })}
              </div>
            </Page>
          );
        })}
      </HTMLFlipBook>
      <Box
        position="fixed"
        bottom="0"
        left="0"
        width="100%"
        zIndex="100"
        bgColor="rgba(255, 255, 255, 0.9)"
        h="60px"
        px={2}
        py={1}
      >
        {editMode && (
          <Flex justifyContent="space-between">
            <Button onClick={toggleDragAndDropMode}>
              {dragAndDropMode ? "Disable" : "Enable"} Drag & Drop
            </Button>
            <Button onClick={toggleResizeMode}>
              {resizeMode ? "Disable" : "Enable"} Resize
            </Button>
          </Flex>
        )}
        <NavigationButtons flipBook={flipBook} />
      </Box>
    </Box>
  );
};

export default NoteBook;
