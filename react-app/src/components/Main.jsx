import Hero from "./Hero.jsx";
import "../css/Main.css";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faArrowRightLong,
} from "@fortawesome/free-solid-svg-icons";

function Main() {
  const [classificationResult, setClassificationResult] = useState(null);
  const [loading, setLoading] = useState(false); // State to manage loading status
  /* -- Carousel Navigation -- */
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedClass, setCorrectAnimal] = useState("");
  const slidesRef = useRef(null);

  useEffect(() => {
    slidesRef.current = document.getElementsByTagName("article");
  }, []);

  const handleLeftClick = () => {
    const nextIndex =
      activeIndex - 1 >= 0 ? activeIndex - 1 : slidesRef.current.length - 1;

    const currentSlide = document.querySelector(
        `[data-index="${activeIndex}"]`
      ),
      nextSlide = document.querySelector(`[data-index="${nextIndex}"]`);

    currentSlide.dataset.status = "after";

    nextSlide.dataset.status = "becoming-active-from-before";

    setTimeout(() => {
      nextSlide.dataset.status = "active";
      setActiveIndex(nextIndex);
    });
  };

  const handleRightClick = (event) => {
    event.preventDefault();

    const nextIndex =
      activeIndex + 1 <= slidesRef.current.length - 1 ? activeIndex + 1 : 0;

    const currentSlide = document.querySelector(
        `[data-index="${activeIndex}"]`
      ),
      nextSlide = document.querySelector(`[data-index="${nextIndex}"]`);

    currentSlide.dataset.status = "before";

    nextSlide.dataset.status = "becoming-active-from-after";

    setTimeout(() => {
      nextSlide.dataset.status = "active";
      setActiveIndex(nextIndex);
    });
  };

  /* -- Mobile Nav Toggle -- */

  const nav = document.querySelector("nav");

  const handleNavToggle = () => {
    nav.dataset.transitionable = "true";

    nav.dataset.toggled = nav.dataset.toggled === "true" ? "false" : "true";
  };

  window.matchMedia("(max-width: 800px)").onchange = (e) => {
    nav.dataset.transitionable = "false";

    nav.dataset.toggled = "false";
  };

  const inputFileRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState(null);

  const handleSelectImageClick = () => {
    inputFileRef.current.click();
  };

  const handleFileChange = (event) => {
    const image = event.target.files[0];
    if (image.size < 5000000) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setImageName(image.name);
      };
      reader.readAsDataURL(image);
    } else {
      alert("Image size more than 5MB");
    }
  };

  const [showButtons, setShowButtons] = useState(false);

  const showCategoryButtons = () => {
    setShowButtons(true);
  };

  const hideCategoryButtons = () => {
    setShowButtons(false);
  };

  const classifyImage = async (event) => {
    setLoading(true); // Set loading to true when starting request
    const file = inputFileRef.current.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/classifyImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setClassificationResult(response.data); // Update classificationResult state
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false after request completion
    }
  };

  const correctClassification = async (event) => {
    const predictedClass = classificationResult.Predicted_Class;

    // Debug: Check the value of predictedClass
    console.log("Predicted Class:", predictedClass);

    const formData = new FormData();
    formData.append("image", inputFileRef.current.files[0]);
    formData.append("predictedClass", predictedClass);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/correctClassification",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(response.data); // Check the server response
      console.log(classificationResult);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      wrongClassification();
    }
  }, [selectedClass]);

  const handleClick = (animal) => {
    setCorrectAnimal(animal);
  };

  const wrongClassification = async (event) => {
    const file = inputFileRef.current.files[0];
    const formData = new FormData();
    formData.append("image", file);

    // Use the selectedAnimal state variable
    let correctedClass = selectedClass;

    // Debug: Check the value of predictedClass
    console.log("Corrected Class:", correctedClass);

    formData.append("correctedClass", correctedClass);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/wrongClassification",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(response.data); // Check the server response
      console.log(classificationResult);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <main>
        <article data-index="0" data-status="active">
          <div className="article-hero article-section">
            <Hero></Hero>
          </div>
          <div className="article-description-section article-section">
            <p>
              This is a website dedicated to image classification. Determine
              whether a picture contains Giraffe, Pig or, Moose. Click the Right
              Arrow to proceed.
            </p>
          </div>
          <div className="article-title-section article-section">
            <h2>Image Classifier</h2>
          </div>
          <div className="article-nav-section article-section">
            <button
              className="article-nav-button"
              type="button"
              onClick={handleLeftClick}
            >
              <FontAwesomeIcon icon={faArrowLeftLong} />
            </button>
            <button
              className="article-nav-button"
              type="button"
              onClick={handleRightClick}
            >
              <FontAwesomeIcon icon={faArrowRightLong} />
            </button>
          </div>
        </article>
        <article data-index="1" data-status="inactive">
          <div class="article-hero article-section">
            <div className="container">
              <input
                type="file"
                id="file"
                accept="image/*"
                ref={inputFileRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div className="img-area" data-img={imageName}>
                <i className="bx bxs-cloud-upload icon"></i>
                <h3>Upload Image</h3>
                <p>
                  Image size must be less than <span>5MB</span>
                </p>
                {imageSrc && <img src={imageSrc} alt={imageName} />}
              </div>
              <button
                className="select-image select-image-button"
                onClick={handleSelectImageClick}
              >
                Select Image
              </button>
            </div>
          </div>
          <div className="article-description-section article-section">
            {loading ? (
              <div className="loading-container">
                <p className="loading-message">Loading...</p>
              </div>
            ) : (
              <>
                <div className="results">
                  <p>Predicted Class:</p>
                  <p>
                    {classificationResult
                      ? classificationResult.Predicted_Class.toUpperCase() ===
                        "BOAR"
                        ? "NOT PART OF THE PROGRAM"
                        : classificationResult.Predicted_Class.toUpperCase()
                      : ""}
                  </p>
                </div>
                <div className="results">
                  <p>Accuracy:</p>
                  <p>
                    {classificationResult
                      ? (classificationResult.Accuracy_Result * 100).toFixed(
                          2
                        ) + "%"
                      : ""}
                  </p>
                </div>
                <div className="results">
                  <p>Precision:</p>
                  <p>
                    {classificationResult
                      ? classificationResult.Precision_Result.toFixed(2)
                      : ""}
                  </p>
                </div>
                <div className="results">
                  <p>Recall:</p>
                  <p>
                    {classificationResult
                      ? classificationResult.Recall_Result.toFixed(2)
                      : ""}
                  </p>
                </div>
                <div className="results">
                  <p>F1-Score:</p>
                  <p>
                    {classificationResult
                      ? classificationResult.F1_Score.toFixed(2)
                      : ""}
                  </p>
                </div>
                <div className="results">
                  <p>Loss:</p>
                  <p>
                    {classificationResult
                      ? (classificationResult.Loss * 100).toFixed(2) + "%"
                      : ""}
                  </p>
                </div>
                <div className="results">
                  <p>Val Accuracy:</p>
                  <p>
                    {classificationResult
                      ? (classificationResult.Val_Accuracy * 100).toFixed(2) +
                        "%"
                      : ""}
                  </p>
                </div>
                <div className="results">
                  <p>Val Loss:</p>
                  <p>
                    {classificationResult
                      ? classificationResult.Val_Loss.toFixed(2) + "%"
                      : ""}
                  </p>
                </div>
              </>
            )}
            <button
              className="select-image select-image-button"
              onClick={() => {
                hideCategoryButtons();
                classifyImage();
              }}
            >
              Classify Image
            </button>
            <div className="button-container">
              <button
                className="select-image correct"
                onClick={correctClassification}
              >
                Correct
              </button>
              <button
                className="select-image wrong"
                onClick={showCategoryButtons}
              >
                Wrong
              </button>
            </div>
            {showButtons && (
              <div className="button-container category-buttons">
                <button
                  className="select-image giraffe"
                  onClick={() => handleClick("giraffe")}
                >
                  Giraffe
                </button>
                <button
                  className="select-image moose"
                  onClick={() => handleClick("moose")}
                >
                  Moose
                </button>
                <button
                  className="select-image pig"
                  onClick={() => handleClick("pig")}
                >
                  Pig
                </button>
              </div>
            )}
          </div>
          <div className="article-title-section article-section">
            <h2>Input Image to Begin</h2>
          </div>
          <div className="article-nav-section article-section">
            <button
              className="article-nav-button"
              type="button"
              onClick={handleLeftClick}
            >
              <FontAwesomeIcon icon={faArrowLeftLong} />
            </button>
            <button
              className="article-nav-button"
              type="button"
              onClick={handleRightClick}
            >
              <FontAwesomeIcon icon={faArrowRightLong} />
            </button>
          </div>
        </article>
      </main>
      ;
    </>
  );
}

export default Main;
