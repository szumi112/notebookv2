import { Box, Text } from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";

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
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [singlePage, setSinglePage] = useState(window.innerWidth < 1400);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBook = useRef();

  useEffect(() => {
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
        <Page number="1" className="wooden-background">
          <Text
            color="white"
            fontWeight={"bold"}
            fontSize="150px"
            textShadow={"3px 3px 3px rgba(0,0,0,0.3)"}
          >
            Jason and Wife
          </Text>
        </Page>
        <Page number="2">How we met..</Page>
        <Page number="3">First date..</Page>
        <Page number="4">Our secret..</Page>
        <Page number="3">The day when we..</Page>
        <Page number="4">Page 6</Page>
        <Page number="3">Page 7</Page>
        <Page number="4">Page 8</Page>
        <Page number="3">Page 9</Page>
        <Page number="4">Page 10</Page>
        <Page number="3">Page 11</Page>
        <Page number="4">Page 12</Page>
      </HTMLFlipBook>
      {/* <div>Current Page: {currentPage + 1}</div> */}
    </Box>
  );
};

export default NoteBook;
