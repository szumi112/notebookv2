import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import HTMLFlipBook from "react-pageflip";
import { db } from "./firebase";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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

const Page = React.forwardRef((props, ref) => {
  return (
    <div className={`page ${props.className}`} ref={ref} data-density="hard">
      <div className="page-content">
        <h1>{props.children}</h1>
      </div>
    </div>
  );
});

const NoteBook = () => {
  const [pages, setPages] = useState([]);
  const [uploadedItems, setUploadedItems] = useState({});
  const [editMode, setEditMode] = useState(false);
  console.log(editMode);

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [singlePage, setSinglePage] = useState(window.innerWidth < 1400);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBook = useRef();

  useEffect(() => {
    const pagesCollectionRef = collection(db, "pages");
    const getPagesList = async () => {
      try {
        const data = await getDocs(pagesCollectionRef);
        const fetchedPages = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPages(fetchedPages);
      } catch (err) {
        console.log(err);
      }
    };

    const getUploadedItems = async () => {
      const itemsCollectionRef = collection(db, "users");
      try {
        const data = await getDocs(itemsCollectionRef);
        const items = data.docs.reduce((acc, doc) => {
          const pageNum = doc.id.split("_")[0];
          if (!acc[pageNum]) {
            acc[pageNum] = [];
          }
          acc[pageNum].push(doc.data());
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

  const onPageFlip = (e) => {
    setCurrentPage(e.data);
  };

  const renderMedia = (item) => {
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

    return isVideo ? (
      <video controls>
        <source src={item.mostRecentUploadURL} />
      </video>
    ) : (
      <Image
        src={item.mostRecentUploadURL}
        alt="Uploaded content"
        width="50%"
      />
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const sourcePageNumber = result.source.droppableId;
    const destinationPageNumber = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const updatedItems = { ...uploadedItems };
    const [movedItem] = updatedItems[sourcePageNumber].splice(sourceIndex, 1);
    updatedItems[destinationPageNumber].splice(destinationIndex, 0, movedItem);

    setUploadedItems(updatedItems);
  };

  useEffect(() => {
    window.addEventListener("click", handleMiddleScreenClick);
    return () => {
      window.removeEventListener("click", handleMiddleScreenClick);
    };
  }, []);

  const handleMiddleScreenClick = (event) => {
    const middleStart = window.innerWidth / 4;
    const middleEnd = middleStart * 3;

    if (event.clientX > middleStart && event.clientX < middleEnd) {
      event.preventDefault();
      event.stopPropagation();
    }
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

  return (
    <Box overflow="hidden" data-density="hard" bgColor={"white"}>
      <DragDropContext onDragEnd={onDragEnd}>
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
                <Droppable droppableId={pageNumber} direction="horizontal">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {items.map((item, idx) => (
                        <Draggable
                          key={`${pageNumber}-${idx}`}
                          draggableId={`${pageNumber}-${idx}`}
                          index={idx}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Box key={idx} w="100%" h="100%">
                                {renderMedia(item)}
                              </Box>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Page>
            );
          })}
        </HTMLFlipBook>
      </DragDropContext>
      {editMode && <NavigationButtons flipBook={flipBook} />}
    </Box>
  );
};

export default NoteBook;
