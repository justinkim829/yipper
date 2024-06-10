/**
 * Name: Jinseok Kim
 * Date: May 22, 2024
 * This file represents a social network service "Yipper".
 * Inspired by the website 'Twitter'.
 * This site is exclusively for dogs.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Initializes the Yipper SNS
   * Loads and shows existing yips and activates buttons
   */
  async function init() {
    await pageLoad();
    activateSearchBar();
    activateHomeBtn();
    searchIndividualUserYip();
    likeYip();
    addNewYip();
  }

  /**
   * Get and display all yips in the home view
   */
  async function pageLoad() {
    try {
      let allData = await getData("/yipper/yips");
      for (let i = 0; i < allData.yips.length; i++) {
        id("home").appendChild(createYipCard(allData.yips[i]));
      }
    } catch (err) {
      id("yipper-data").classList.add("hidden");
      id("error").classList.remove("hidden");
    }
  }

  /**
   * Activate search bar to filter yips.
   * Search button is enabled
   * when the trimmed input is not a blank whitespace.
   */
  function activateSearchBar() {
    let searchBar = id("search-term");
    let searchBtn = id("search-btn");
    searchBar.addEventListener("input", function() {
      if (this.value.trim()) {
        searchBtn.disabled = false;
      } else {
        searchBtn.disabled = true;
      }
    });
    searchBtn.addEventListener("click", activateSearchBtn);
  }

  /**
   * Switch view to home view.
   * Show only the filtered yips
   */
  async function activateSearchBtn() {
    let cards = qsa(".card");
    let searchBar = id("search-term");
    let searchBtn = id("search-btn");
    changeView("home");

    try {
      let searchWord = searchBar.value.trim();
      let searchData = await getData(`/yipper/yips?search=${searchWord}`);
      searchBtn.disabled = true;
      let matchedIDArray = searchData.yips;
      let matchedIDs = matchedIDArray.map(object => object.id);
      for (let i = 0; i < cards.length; i++) {
        cards[i].classList.remove("hidden");
        if (!matchedIDs.includes(parseInt(cards[i].id))) {
          cards[i].classList.add("hidden");
        }
      }
    } catch (err) {
      id("yipper-data").classList.add("hidden");
      id("error").classList.remove("hidden");
    }
  }

  /**
   * Switch to home view.
   * Display all yips that exist.
   */
  function activateHomeBtn() {
    id("home-btn").addEventListener("click", () => {
      changeView("home");
      id("search-term").value = "";
      qsa(".card").forEach(card => {
        card.classList.remove("hidden");
      });
    });
  }

  /**
   * Switch to user view
   * Get and show all yips of an individual user
   * when the username of a yip is clicked.
   */
  function searchIndividualUserYip() {
    let userTags = qsa("p.individual");
    userTags.forEach(userTag => {
      userTag.addEventListener("click", async () => {
        changeView("user");
        let username = userTag.textContent;
        let userYips = await getData(`/yipper/user/${username}`);
        addYipsByUser(userYips);
      });
    });
  }

  /**
   * Create and add containers for all the yips created by the individual user.
   * @param {Array} yips - Array of objects that contain data of yips the user created.
   */
  function addYipsByUser(yips) {
    let container = gen("article");
    container.classList.add("single");

    let h2 = gen("h2");
    h2.textContent = `Yips shared by ${yips[0].name}: `;
    container.appendChild(h2);

    for (let i = 0; i < yips.length; i++) {
      let eachYip = gen("p");
      eachYip.textContent = `Yip ${i + 1}: ${yips[i].yip} #${yips[i].hashtag}`;
      container.appendChild(eachYip);
    }
    id("user").innerHTML = "";
    id("user").appendChild(container);
  }

  /**
   * Increment the number of likes when the like image (heart) is clicked.
   */
  function likeYip() {
    qsa("img[src='img/heart.png']").forEach(heartImg => {
      heartImg.addEventListener("click", (evt) => {
        let params = new FormData();
        params.append("id", evt.currentTarget.parentNode.parentNode.parentNode.id);
        updateLikedYip(heartImg, params);
      });
    });
  }

  /**
   * Triggered when the like image (heart) is clicked.
   * Get and increment the number of likes.
   * Store the incremented value.
   * @param {img} heartImg - clicked to like a yip
   * @param {FormData} params - stores the id of the yip that was clicked
   */
  async function updateLikedYip(heartImg, params) {
    try {
      let result = await postData("/yipper/likes", params, false);
      heartImg.nextSibling.textContent = parseInt(result);
    } catch (err) {
      id("yipper-data").classList.add("hidden");
      id("error").classList.remove("hidden");
    }
  }

  /**
   * Switch to new yip view
   * Create and store new yip when values inputted and button clicked.
   */
  function addNewYip() {
    id("yip-btn").addEventListener("click", () => {
      changeView("new");
      qs("form").addEventListener("submit", (evt) => {
        evt.preventDefault();
        storeAndShowNewYip();
      });
    });
  }

  /**
   * Create and store the new yip.
   * Add the new yip to the main view.
   * Switch to the main view after 2 seconds
   */
  async function storeAndShowNewYip() {
    let params = new FormData();
    params.append("name", id("name").value);
    params.append("full", id("yip").value);

    try {
      let result = await postData("/yipper/new", params, true);
      id("home").prepend(createYipCard(result));
      qs("img[src='img/heart.png']").addEventListener("click", (evt) => {
        params = new FormData();
        params.append("id", evt.currentTarget.parentNode.parentNode.parentNode.id);
        updateLikedYip(evt.currentTarget, params);
      });
    } catch (err) {
      id("yipper-data").classList.add("hidden");
      id("error").classList.remove("hidden");
    }
    id("name").value = "";
    id("yip").value = "";
    setTimeout(() => {
      changeView("home");
    }, 2000);
  }

  /**
   * Switch between the home, user, and new view
   * @param {string} view - the view to show
   */
  function changeView(view) {
    let viewOptions = ["home", "user", "new"];
    for (let i = 0; i < viewOptions.length; i++) {
      if (viewOptions[i] === view) {
        id(viewOptions[i]).classList.remove("hidden");
      } else {
        id(viewOptions[i]).classList.add("hidden");
      }
    }
  }

  /**
   * Create a container for a yip in the home view
   * @param {Object} data - data of a yip
   * @returns {Element} article - container for a yip
   */
  function createYipCard(data) {
    let article = gen("article");
    article.classList.add("card");
    article.id = data.id;

    let img = createImgForYipCard(data);
    let div1 = createDiv1ForYipCard(data);
    let div2 = createDiv2ForYipCard(data);

    article.appendChild(img);
    article.appendChild(div1);
    article.appendChild(div2);

    return article;
  }

  /**
   * Create img of the user
   * @param {Object} data - data of a yip
   * @returns {Element} img - img for the container
   */
  function createImgForYipCard(data) {
    let img = gen("img");
    let name = data.name.toLowerCase().replace(/\s+/g, '-');
    img.src = "img/" + name + ".png";
    img.alt = name;

    return img;
  }

  /**
   * Create yip text container for the yip container
   * @param {Object} data - data of a yip
   * @returns {Element} div1 - text container
   */
  function createDiv1ForYipCard(data) {
    let div1 = gen("div");
    let firstP = gen("p");
    let secondP = gen("p");
    firstP.classList.add("individual");
    firstP.textContent = data.name;
    secondP.textContent = data.yip + " #" + data.hashtag;
    div1.appendChild(firstP);
    div1.appendChild(secondP);

    return div1;
  }

  /**
   * Create number-of-likes container for the yip container
   * @param {Object} data - data of a yip
   * @returns {Element} div2 - like-container
   */
  function createDiv2ForYipCard(data) {
    let div2 = gen("div");
    div2.classList.add("meta");
    let div2P = gen("p");
    let date = new Date(data.date).toLocaleString();
    div2P.textContent = date;
    let div2Div = gen("div");
    let divImg = gen("img");
    divImg.src = "img/heart.png";
    let divP = gen("p");
    divP.textContent = data.likes;
    div2Div.appendChild(divImg);
    div2Div.appendChild(divP);
    div2.appendChild(div2P);
    div2.appendChild(div2Div);

    return div2;
  }

  /**
   * Fetches a get request from the given endpoint
   *
   * @param {String} url - endpoint to the request
   * @returns {Object} result - object that contains the result of the request
   */
  async function getData(url) {
    try {
      let result = await fetch(url);
      statusCheck(result);
      result = result.json();
      return result;
    } catch (err) {
      id("yipper-data").classList.add("hidden");
      id("error").classList.remove("hidden");
    }
  }

  /**
   * Fetches a post request from the given endpoint
   * @param {String} url - endpoint to the request
   * @param {FormData} params - params given to the request
   * @param {Boolean} isReturnJSON - whether the response is a JSON object
   * @returns {Object} result - object that contains the result of the request
   */
  async function postData(url, params, isReturnJSON) {
    try {
      let result = await fetch(url, {
        method: 'POST',
        body: params
      });
      await statusCheck(result);
      if (isReturnJSON) {
        result = await result.json();
      } else {
        result = await result.text();
      }
      return result;
    } catch (err) {
      id("yipper-data").classList.add("hidden");
      id("error").classList.remove("hidden");
    }
  }

  /**
   * Checks the status of the response.
   * @param {Response} result - The response object.
   * @throws an error if the response is not ok.
   */
  async function statusCheck(result) {
    if (!result.ok) {
      throw new Error(await result.text());
    }
  }

  /**
   * Generates a new HTML element of the specified type.
   * @param {string} element - The tag name of the element to be created.
   * @returns {Element} The new element.
   */
  function gen(element) {
    return document.createElement(element);
  }

  /**
   * Retrieves an element by its ID.
   * @param {string} id - The ID of the element to retrieve.
   * @returns {Element} The element with the specified ID.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Retrieves the first element that matches the specified CSS selector.
   * @param {string} element - The CSS selector to match.
   * @returns {Element} The first matching element.
   */
  function qs(element) {
    return document.querySelector(element);
  }

  /**
   * Retrieves all elements that matches the specified CSS selector.
   * @param {string} selector - The CSS selector to match.
   * @returns {Element} The first matching element.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();