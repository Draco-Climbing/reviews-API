# Draco API
## reviews API
This server API uses Node, Express, and MongoDB to deliver product reviews.

### Quickstart
Clone the repo, modify the .env file as needed with the following information:
```
MONGO_DB = 'sdc'
MONGO_CONNECTION = 'sdc-mongo'
MONGOIP = '3.145.24.16'
```

Install dependencies with the following command:
```bash
npm run install
```

Start the server with the following command:
```bash
npm run start
```

### API Example
GET /reviews/?product_id=100&page=1&count=3
```
{
    "product_id": "100",
    "page": 1,
    "count": 3,
    "results": [
        {
            "review_id": 501,
            "rating": 5,
            "summary": "Et ipsam reprehenderit eum iste odit omnis illum.",
            "body": "Perspiciatis et quas cum aut ea laboriosam. Repudiandae id quam qui fugiat et voluptas debitis. Sit iure quia qui deserunt quis perspiciatis culpa. Ullam rerum nihil ea enim molestias reprehenderit quis delectus. Fugiat nesciunt delectus excepturi.",
            "recommend": true,
            "reviewer_name": "Brayan.Goldner28",
            "response": "null",
            "helpfulness": 18,
            "photos": [
                {
                    "id": 238,
                    "url": "https://images.unsplash.com/photo-1544376664-80b17f09d399?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1525&q=80"
                }
            ],
            "date": "2021-02-04T09:29:56.950Z"
        },
        {
            "review_id": 498,
            "rating": 2,
            "summary": "Qui molestias deserunt dolor sunt aut.",
            "body": "Et quis aut. Quo est qui illum fugit eum veritatis. Est est consequatur eos est. Facilis deleniti harum provident repellendus corrupti sit sed non corporis. Earum eum voluptatem et maxime harum reiciendis laudantium debitis. Voluptatem quia repellat voluptas aperiam eum voluptate amet cumque quaerat.",
            "recommend": true,
            "reviewer_name": "Cali48",
            "response": "null",
            "helpfulness": 10,
            "photos": [
                {
                    "id": 237,
                    "url": "https://images.unsplash.com/photo-1510217167326-549ae78e4738?ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80"
                }
            ],
            "date": "2020-11-06T00:34:43.737Z"
        },
        {
            "review_id": 502,
            "rating": 4,
            "summary": "Voluptates officiis nulla quibusdam voluptates.",
            "body": "Totam corporis nobis commodi sint voluptas totam eaque corporis deserunt. Facilis illo commodi est quo ut nesciunt. Sed quod aut. Cupiditate voluptates aliquid minus magni eos.",
            "recommend": true,
            "reviewer_name": "Aisha_Collier68",
            "response": "null",
            "helpfulness": 25,
            "photos": [
                {
                    "id": 239,
                    "url": "https://images.unsplash.com/photo-1515110371136-7e393289662c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1656&q=80"
                }
            ],
            "date": "2020-10-03T02:29:20.363Z"
        }
    ]
}
```

GET /reviews/meta/?product_id=1111
```
{
    "product_id": "1111",
    "ratings": {
        "1": 3,
        "2": 0,
        "3": 1,
        "4": 3,
        "5": 2
    },
    "recommended": {
        "true": 6,
        "false": 3
    },
    "characteristics": {
        "Length": {
            "id": 3698,
            "value": "2.6667"
        },
        "Fit": {
            "id": 3697,
            "value": "3.4444"
        },
        "Comfort": {
            "id": 3699,
            "value": "3.2222"
        },
        "Quality": {
            "id": 3700,
            "value": "3.2222"
        }
    }
}
```