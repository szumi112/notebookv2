import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "@chakra-ui/react";
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

    getPagesList();

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setSize({
        width: newWidth,
        height: newHeight,
      });
      setSinglePage(newWidth < 1400);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onPageFlip = (e) => {
    setCurrentPage(e.data);
  };

  console.log(pages);

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
          </Page>
        ))}
      </HTMLFlipBook>
    </Box>
  );
};

export default NoteBook;
