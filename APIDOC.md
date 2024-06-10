# Jinseok Kim API Documentation for Yipper

## **GET /yipper/yips**
Retrieves all yips or yips that match the search term.

**Request Type:** *GET*

**Returned Data Format**: JSON

**Request Parameters:**
- `search` (query parameter, optional): The search term for filtering yips by hashtag.

**Response:**
- Status: 200
  - Returns a JSON object containing yips.
- Status: 500
  - An error occurred on the server. Try again later.

**Example Request:**
GET /yipper/yips

**Example Response:**
{
  "yips": [
    {
      "id": 34,
      "name": "user2",
      "yip": "Hello World!",
      "hashtag": "greetings",
      "date": "2023-01-02T00:00:00Z",
      "likes": 5
    },
    {
      "id": 33,
      "name": "user1",
      "yip": "Another yip",
      "hashtag": "yipping",
      "date": "2023-01-01T00:00:00Z",
      "likes": 3
    }
  ]
}


---

## **GET /yipper/user/:user**
Retrieves all yips from a specific user.

**Request Type:** *GET*

**Returned Data Format**: JSON

**Request Parameters:**
- `user` (URL parameter, required): The username to filter yips.

**Response:**
- Status: 200
  - Returns a JSON object containing yips from the specified user.
- Status: 400
  - Yikes. User does not exist.
- Status: 500
  - An error occurred on the server. Try again later.

**Example Request:**
GET /yipper/user/justin

**Example Response:**
{
  "yips": [
    {
      "name": "justin",
      "yip": "Hello from Justin!",
      "hashtag": "HI",
      "date": "2023-01-02T00:00:00Z"
    },
    {
      "name": "justin",
      "yip": "Another day, another yip.",
      "hashtag": "daily",
      "date": "2023-01-01T00:00:00Z"
    }
  ]
}

---

## **POST /yipper/likes**
Updates the likes for a specific yip.

**Request Type:** *POST*

**Returned Data Format**: Plain Text

**Request Parameters:**
- `id` (body parameter, required): The ID of the yip to update likes.

**Response:**
- Status: 200
  - Returns the updated number of likes for the specified yip.
- Status: 400
  - Yikes. ID does not exist.
- Status: 400
  - Missing one or more of the required params.
- Status: 500
  - An error occurred on the server. Try again later.

**Example Body:**
{
  "id":34
}

**Example Response:**
5
---

## **POST /yipper/new**
Creates a new yip.

**Request Type:** *POST*

**Returned Data Format**: JSON

**Request Parameters:**
- `name` (body parameter, required): The name of the user creating the yip.
- `full` (body parameter, required): The full text of the yip, including the hashtag.

**Response:**
- Status: 200
  - Returns the newly created yip as a JSON object.
- Status: 400
  - Missing one or more of the required params.
- Status: 500
  - An error occurred on the server. Try again later.

**Example Body**
{
  "name": "justin",
  "full": "This is my first yip! #excited"
}

**Example Response:**
{
  "id": 35,
  "name": "justin",
  "yip": "This is my first yip!",
  "hashtag": "excited",
  "likes": 0
}