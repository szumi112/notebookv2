import React, { useState, useEffect, useRef } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import HTMLFlipBook from "react-pageflip";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

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
    };

    getPagesList();
    getUploadedItems();

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setSize({
        width: newWidth,
        height: newHeight,
      });
      setSinglePage(newWidth < 1400);
    };

    console.log("Uploaded Items:", uploadedItems);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      item.mostRecentUploadURL.toLowerCase().endsWith(`.${ext}`)
    );

    return isVideo ? (
      <video controls width="100%">
        <source src={item.mostRecentUploadURL} />
      </video>
    ) : (
      <Image
        src={item.mostRecentUploadURL}
        alt="Uploaded content"
        width="100%"
      />
    );
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
      >
        {pages.map((page, index) => (
          <Page
            key={page.id}
            className={index === 0 ? "wooden-background" : ""}
          >
            <Text>{page.title}</Text>

            {uploadedItems[page.id] &&
              uploadedItems[page.id].length > 0 &&
              uploadedItems[page.id].map((item, idx) => (
                <Box key={idx} w="100%" h="100%">
                  {renderMedia(item)}
                </Box>
              ))}
          </Page>
        ))}
      </HTMLFlipBook>
    </Box>
  );
};

export default NoteBook;
