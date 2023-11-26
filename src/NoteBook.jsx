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
    <Flex justifyContent="space-between" p={4}>
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
        const items = data.docs.reduce((acc, doc) => {
          const itemData = doc.data();
          const pageNum = doc.id.split("_")[0];
          if (!acc[pageNum]) {
            acc[pageNum] = [];
          }
          acc[pageNum].push(itemData);
          return acc;
        }, {});

        setUploadedItems(items);
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

    const itemRef = doc(db, "users", `${pageNumber}_${item.id}`);
    await setDoc(
      itemRef,
      { width: newWidth, height: newHeight },
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

    const itemWidth = item.width || 200;
    const itemHeight = item.height || 200;

    const resizableProps = {
      width: item.width || 200,
      height: item.height || 200,
      onResizeStop: (event, resizeData) =>
        handleResizeStop(item, resizeData, pageNumber),
      disabled: !resizeMode,
    };

    return (
      <ResizableBox {...resizableProps}>
        {isVideo ? (
          <video controls>
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

  const handleDragStop = async (item, e, data, pageNumber) => {
    const newX = data.x;
    const newY = data.y;

    const itemRef = doc(db, "users", `${pageNumber}_${item.id}`);
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
      {editMode && (
        <>
          <Flex justifyContent="space-between" p={4}>
            <Button onClick={toggleDragAndDropMode}>
              {dragAndDropMode ? "Disable" : "Enable"} Drag & Drop
            </Button>
            <Button onClick={toggleResizeMode}>
              {resizeMode ? "Disable" : "Enable"} Resize
            </Button>
          </Flex>
          <NavigationButtons flipBook={flipBook} />
        </>
      )}
    </Box>
  );
};

export default NoteBook;
