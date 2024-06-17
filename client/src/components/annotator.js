import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useParams } from "react-router-dom";

const useImageFromUrl = ({ ctgName, collectionName, currentIndex, split }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scribbles, setScribbles] = useState([]);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch("http://10.4.16.102:1510/fetch_annotation", {
          method: "GET",
          headers: {
            "ctgName": ctgName,
            "collectionName": collectionName,
            "imgIdx": currentIndex,
            "split": split,
            "annotation": "",
            "highRes": true,
          }
        });
        const blob = await response.blob();
        const img = new window.Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          setImage(img);
          URL.revokeObjectURL(img.src);
        };
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    const fetchScribbles = async () => {
      try {
        const response = await fetch("http://10.4.16.102:1510/fetch_scribbles", {
          method: "GET",
          headers: {
            "ctgName": ctgName,
            "collectionName": collectionName,
            "imgIdx": currentIndex,
            "split": split,
          }
        });
        if (!response.ok) {
          throw new Error("Failed to load existing annotation!");
        }
        const data = await response.json();
        console.log("The obtained scribbles are " + data.scribbles);
        setScribbles(data.scribbles);
        setLoading(false);
      } catch (error) {
        console.error("Failed to send to reannotate", error);
        setLoading(false);
      }
    };

    fetchImage();
    fetchScribbles();
  }, [ctgName, collectionName, currentIndex, split]);

  return [image, loading, scribbles];
};

const ImageCanvas = () => {
  let { collectionName, ctgName, split, currentIndex } = useParams();
  const [image, loading, scribbles] = useImageFromUrl({ ctgName, collectionName, currentIndex, split });
  const [polylines, setPolylines] = useState([]);
  const [currentPolyline, setCurrentPolyline] = useState([]);
  const [selectedPolyline, setSelectedPolyline] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const stageRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return;

      if (e.key === 'Escape') {
        let newPolyLines = [...polylines, currentPolyline];
        setPolylines(newPolyLines);
        setCurrentPolyline([]);
        setMousePosition(null);
      }

      if (e.key === 'Delete') {
        if (selectedPolyline !== null) {
          handleDeletePolyline();
        }
      }

      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        sendPostRequest();
      }
    };

    const sendPostRequest = async () => {
      const data = {
        ctgName,
        collectionName,
        split,
        currentIndex,
        scribbles: polylines,
        scaleFactor,
      };

      try {
        const response = await fetch('http://10.4.16.102:1510/save_scribbles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to save scribbles');
        }

        const responseData = await response.json();
        console.log('Response:', responseData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPolyline, polylines, selectedPolyline, loading]);

  const handleMouseDown = (e) => {
    if (loading || e.evt.button !== 0) return;
    const stage = stageRef.current.getStage();
    const point = stage.getPointerPosition();
    console.log(point);
    setCurrentPolyline([...currentPolyline, point]);
  };

  const handleMouseMove = (e) => {
    if (loading) return;
    const stage = stageRef.current.getStage();
    const point = stage.getPointerPosition();
    console.log(point);
    setMousePosition(point);
  };

  const handleMouseUp = () => {
    if (loading || currentPolyline.length === 0) return;
  };

  const handlePolylineClick = (index) => {
    if (loading) return;
    setSelectedPolyline(index);
  };

  const handleDeletePolyline = () => {
    if (loading || selectedPolyline === null) return;
    const newPolylines = polylines.filter((_, index) => index !== selectedPolyline);
    setPolylines(newPolylines);
  };

  let currentLinePoints = currentPolyline.flat();
  if (mousePosition && currentPolyline.length > 0) {
    currentLinePoints = [...currentLinePoints, mousePosition.x, mousePosition.y];
  }

  let displayWidth = 0;
  let displayHeight = 0;
  let scaleFactor = 0;
  if (image !== null && image.width > image.height) {
    displayWidth = 5000;
    displayHeight = (image.height / image.width) * displayWidth;
    scaleFactor = displayWidth / image.width;
  } else if (image !== null) {
    displayHeight = 5000;
    displayWidth = (image.width / image.height) * displayHeight;
    scaleFactor = displayHeight / image.height;
  }
  if (image !== null) {
    console.log("displayed and scaled: " + displayHeight / scaleFactor, displayWidth / scaleFactor);
    console.log("original: " + image.height, image.width);
    console.log("image.x = " + image.x);
    console.log("image.y = " + image.y);
  }

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <TransformWrapper wheel={{ disabled: true }}>
          <TransformComponent>
            <Stage
              width={5000}
              height={5000}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={stageRef}
            >
              <Layer>
                {image && (
                  <KonvaImage
                    image={image}
                    x={0}
                    y={0}
                    width={displayWidth}
                    height={displayHeight}
                  />
                )}
                {polylines.map((polyline, index) => (
                  <React.Fragment key={index}>
                    <Line
                      points={polyline.flatMap(p => [p.x, p.y])}
                      stroke={selectedPolyline === index ? "yellow" : "red"}
                      strokeWidth={7}
                      lineCap="round"
                      lineJoin="round"
                      onClick={(e) => {
                        if (e.evt.button === 1) {
                          handlePolylineClick(index);
                        }
                      }}
                    />
                    {polyline.map((point, pIndex) => (
                      <Circle
                        key={`polyline-${index}-${pIndex}`}
                        x={point.x}
                        y={point.y}
                        radius={10}
                        fill={selectedPolyline === index ? "yellow" : "red"}
                        onClick={(e) => {
                          if (e.evt.button === 1) {
                            handlePolylineClick(index);
                          }
                        }}
                      />
                    ))}
                  </React.Fragment>
                ))}
                {currentPolyline.length > 0 && (
                  <React.Fragment>
                    <Line
                      points={[...currentPolyline.flatMap(p => [p.x, p.y]), ...(mousePosition ? [mousePosition.x, mousePosition.y] : [])]}
                      stroke="blue"
                      strokeWidth={7}
                      lineCap="round"
                      lineJoin="round"
                    />
                    {currentPolyline.map((point, index) => (
                      <Circle
                        key={`current-${index}`}
                        x={point.x}
                        y={point.y}
                        radius={10}
                        fill="blue"
                      />
                    ))}
                  </React.Fragment>
                )}
              </Layer>
            </Stage>
          </TransformComponent>
        </TransformWrapper>
      )}
    </div>
  );
};

export default ImageCanvas;
