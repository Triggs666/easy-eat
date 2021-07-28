# easy-eat


#### easy-eat is a backend for web application thought to allow people to order food form different restaurants at home
### **v. 1.0**  
<br>    
<br> 

    
#### Application is divided in two functional zones:

* Config zone:
  - This zone allow “restaurant managers” to add, update and delete different restaurants
  - Every “restaurant managers” can manage only its own restaurants
  - For every restaurant, “managers” can add, update and delete different dishes
<br>

* Client zone:
  - “clients” can access to the full list of restaurants
  - For every restaurant, “client” can see the list of dishes and can add them to their cart
  - “clients” can access to their cart to add, update and delete items and finally launch the order to restaurants
  - Restaurants receive via mail the list of different dishes included in the client order

<br>    
<br> 
    
#### The architecture used to implement these functions is based in lambda functions as following

 

* Auth lambdas
  - Control the access to different application zones
  - Three different “profiles” defined
    - Auth_ADMIN: Allow access only to “restaurant managers”
    - Auth_CLI: Allow access only to clients
    - Auth: Allow access to both kind of users
  - Client users cannot execute config actions (like edit restaurants or dishes)
  - In order to simplify the access control , auth lambdas use the user ‘nickname’ to distinguish between clients and managers
    - If user nickname starts with ‘admin’, it is a “restaurant manager” otherwise it is a client

 <br> 
 
* Function lambdas
  - Let web functions executions
  - Restaurant functions allow “restaurant managers” to add, update and delete different restaurants
    - They use dynamodb table (indexed by user id) to storage restaurants data
    - Clients users need to “know” all configured restaurants in the web, so “GetAllRestaurant” it’s the only lambda function that execute an scan operation to dynamodb table in order to get the full list of restaurants
    - “GetAllRestaurant” function is only available for clients users 
  - Dishes functions allow “restaurant managers” to add, update and delete different dishes to restaurants
    - They use dynamodb table (indexed by user id & restaurant id) to storage dishes data
  - Cart functions allow “clients” to add, update and delete different dishes into its own shopping cart
    - They use dynamodb table (indexed by user id) to storage user cart data
    - The cart process notify orders to restaurants and delete cart items


 <br> 
 
* Upload URL lambdas
  - Used to upload logos for restaurants or photo for dishes
  - Both use the same S3 bucket

 
<br>    
<br> 

#### Other services and plugins used in the implementation are:

 

* DynamoDB tables to storage restaurant, dishes and shopping cart data
* S3 bucket to storage images for restaurants logos and dishes photos
* SNS service to notify orders to restaurants
  - Every time a new restaurant is created a new topic is associated
  - Restaurant email is used to create a subscription
  - When client users launch execute the order process, a notification is send to the topic associated with restaurants included in cart items
  - Topics and subscription are deleted when the associated restaurant is deleted 
* Auth0 library to access control
* X-Ray as distributed tracing service
* Serverless documentation to check creation and update parameters for restaurant and dishes

 
<br>    
<br> 

#### User tests for backend are included as Postman Collection

 

* Application was added in Auth0 platform and Postman was configured to get users token
* Three different users are already created to execute tests
  - ADMIN1 (“restaurant manager”)
  - ADMIN2(“restaurant manager”)
  - Client1 (client user)
* Tests are divided in three folders
  - Restaurants:
    - Include API calls to test get, add, update and delete restaurants
  - Dishes:
    - Include API calls to test get, add, update and delete dishes
    - Include API calls to add a dish in the shopping cart
  - Cart:
    - Include API calls to test get, add, update and delete dishes
    - Include API calls to process the cart
* Client user have all functions ready to call in order to test access control
  - In case the user is not allowed to execute a function, a  “deny access” error is returned (for example if client user tried to delete a restaurant)
* The frontend of this project has not been developed (yet) so, the web navigation have to be simulated manually. To help this task, some global variables has been defined in Postman
  - restId: Restaurant ID generated when the restaurant is created
  - dishId:  Dish ID generated when the dish is created
  - itemId: Item ID generated when a dish is added to shopping cart
* This variables are used in tests paths and can be modified manually during the tests in order to access the data of specific element (simulating web navigation)
<br>

***Be aware to receive notifications, the email used in restaurant creation have to be valid and the subscription be accepted before launching shopping cart process***
