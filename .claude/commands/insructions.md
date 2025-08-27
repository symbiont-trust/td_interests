# Introduction

This file has my requirements. 

I want you to generate a plan.md of the necessary steps to generate the code.  The plan.md file shoould be generated to the following directory:

<project-directory>/.claude/commands

This is the same directory where this instructions.md file is located.

Note I will later be executing the plan.md file using claude to generate the code.

Therefore if you see improvements over this instructions.md file that can be made when generating plan.md please do so.  We want the plan.md to be in a good format for Claude (you) to generate the code when I later execute the command: "/plan"


# High Level Description of Software

I want to create a website called "My Interests".  It is website where a user can go and register and choose what their interests are.  They can then search for those who have similar interests and make conneection requests to them.  They can accept or dismiss the connection request.

When they accept your friend request you are now connected via your common interests. 

Once connected a user can communicate with their connection via direct private message threads. 

A user can also start a public message threads based on interests. Note the details of the message threads are shown in subsequent sections.

When you register your identity key is your wallet address.  As we are using Reown's App Kit Account abstraction the user does not need to install a wallet like Metamask as they can instead use Reown's own Account Absraction wallet.  Behind the scenes the account abstraction of Reown's App Kit shares the private key fragments in such a way that no single user storing the private key fragments can use the private key for signing.  Only the rightful owner of the key can sign.  This allows a web 2 user who has not installed a wallet to be allocated a wallet behind the scenes.  However web 3 users can use their ethereum compatible wallets.

Note there are also message notifications which work a bit like youtube which are also described in a section below.  The user is notified when someone has replied to their message.

Each user of the "My Interets" website has a profile which captures their connections based on interests.  The data to create the profile is stored in the postgres database.  When the profile is generated for external use, the profile is created as a typescripy object which can be easily converted to json format.  The idea is the json profile is signed by the owner to proove that it has the connections and interests in it they want.  The details of the profile are described in another section.

"My Interests" exposes an api where a request can be made to retrieve the profile of a user if the wallet address is known for that user.  One needs a client-id to be able to call the "Profile API". 

Before being able to call the "Profile API", the client needs to authenticate against the "Profile API".    So the client of the Profile API will pass a client-id in the request and the "My Interests" backend will check the client-id and if it is in its Client database table, will issue a JSON token in the response.  This token will then be used by the Client to call the "Profile API".


# Look and Feel Structure of the website

I want it to have a header wih a title called "My Interests"

There needs to be a menu which has settings in it which is reponsive for both desktop and mobile web views.

The settings menu item should allow the user to edit the details they gave during registration with the exception of the wallet address which they cannot change.

At the bottom of the web page there should be the footer which should have links to:

* Terms and Conditions
* Privacy Policy
* Contact Us

You can generate content which for Terms and Conditions and Privacy Policy which make sense for the description of software section above.

For Contact Us you can add the following details:

Email: john.charles.dickerson@gmail.com
Location: Nairobi, Kenya


# Tech stack

Frontend for Interests website:

* React using vite
* Only use Material design components from mui.com. 
* For crypto wallet management use Reown's App Kit.
* Possibly use Wagmi as a provider wrapping the router config.

Backend for Interests website:

* Java Spring Boot backend using Spring Security, Hibernate and a postgres database

Client code for accessing "ProfileAPI":

* Java Spring Boot using an http client or http template to acccess the "Profile API"


# Lombok

I want to use Lombok for reducing boiler plate code.


# Project structure

I want the project structure to be like the following:

    <project-dir>/frontend
    <project-dir>/backend
    <project-dir>/profile-api-client

The react code goes under the frontend directory while the Spring Boot Code goes under the backend directory.

The profile-api-client directory contains Java Spring Boot code for the caller of the "Profile API" to:

* authenticate and retrieve a JWT token
* retrieve the profile.json file for a specific wallet address along with its signature from the owner.  To create the signature the profile is converted to string format and the spaces removed.  The string is then hashed and the signature is applied on the hash.

# Registering and Login specifics

When registering, the software is using Reown's App Kit.  If they choose to register using 
App Kit's account abstraction then a wallet address will be created for them behind the scenes.

Probably you need to use Wagmi and configure providers which wrap the react router config.

When the user registers they should select their country and their interests.

This sql file contains the country data:

    <project-dir>/sql/continents_countries.sql

This sql file contains the interest data:

    <project-dir>/sql/interest_tags.sql

When generating the spring boot domain classes you need to take a look at the above 2 sql
files to work out what the these Domain classes will looks like:

* Continent
* Country
* InterestTag

So once registered, the postgres database will contain this data:

* the wallet address of the user
* the interests of the user
* the country they belong to
* optionally some location tags for nearby locations.  For example they may tag their location with the town or nearest city name.  These tags are not in standing data and can be anything the user types.  For example a location tag could be: "Near Ngong Esso Petrol Station".
* a handle name which need not be unique.  Note the identifier is the wallet address.

Once the user has registered the spring boot backend sends a JWT token to the frontend.

Ideally the code should also support refresh and the main JWT tokens on both the backend and frontend.

When logging in the user needs to first of all connect using their wallet or the account abstraction wallet.  They are then issued a JWT token which should be stored in the react frontend.  They should use the JWT token when calling backend APIs.

Note that there should be checks for the token on the frontend such as whether the token has expired or not.  If it is expired but they are still connected to the frontend via their wallet or account abstraction wallet, a request should be made to get a new token.

If when calling a backend api to do something like find users to connect to, they may not have the necessary Roles to access the Spring Boot method using the JWT token.  The backend should communicate the problem to the frontend so the frontend can show the right error message or request the user to connect again.

This kind of communication may use header messages and error codes.

Note that the user could be connected but possibly the token expired.  Or they might not have the correct Spring Security roles allocated to them yet to access the API.

For cases like insufficient Roles to access a resource this should be communicated back to the frontend and the frontend should be able to route the user to a page which explains that they have insufficient roles to access a resource.  To do this we can use Axios on the frontend and configure request and response interceptors to do stuff like:

* inject a JWT Token
* catch error codes and error header messages and forward to the correct route

Note that in order for the axios interceptor to navigate to the correct page when receiving an error code we need code like this:

<project-dir>/example_code/axios/axiosHelper.ts

Note that after registering the user should be able to edit details they registered with.  The only thing they cannot change is their wallet address.  They can edit the details they registered with by clicking on settings under the menu.

Note that if in settings they try and remove interests they registered with the following logic needs to be respected:

If removing an interest means they would be left with a connection that has no interess in common, then they should be notified when removing an interest that it will also delete all connections where there are no longer any interests in common.


# Connecting to user specifics

The frontend should allow registered users to search for other users to connect to on the basis of interests and optionally location tags.  As mentioned above a user can add tags for their location on registering.  The location tag may be the name of the nearest town or city but it need not be. 

A user makes a friend request to connect to another user on the basis of common interests.  The other user can dismiss the friend request or accept it.

If user Alice wants to connect to user Bob and Bob is already connected to some of Alice's existing connections, then this should be shown to Alice before making the friend request to Bob.


# Communicating with connections specifics

When a user accepts a connection request from another user we have a connection.  The connection stores the interests the 2 users have in common.

## Private Message Thread specifics

Once a user has registered, they can make connection requests. Once connected a user can communicate with another user via a private message thread.  A private message thread has a subject.

## Public Message Thread specifics

A registered user can also create a public message thread with the following functionality:

* The user tags the public message thread with interest tags they already have.  They need to choose which of their interest tags apply to the message thread. Some of these interest tags were chosen when they registered but as mentioned else where they can edit any registration detail apart from their wallet address after having registered.

* Anyone can search for public message threads on the basis of a subset of interest tags they already have.

* In the search results they can click to be taken to the public message thread.

* Once at the public message thread, a user can tag a message with a tag.  These tags can be anything the user wants.  Others can filter messages in a public message thread on the basis of the tags.  One can decide to filter out messages which have a certain tag or one can decide to only see messages which have been tagged with a certain tag.  

When deciding on what tag to tag a message with a user can type the name of the tag in a box and existing tags which have a similar spelling can be displayed. This allows a user who wants to tag something, to refine their tag name or use an a tag name that a user has previously used.

* a user can reply to another message in the message thread.  There is no limit to how deep in the message tree you can reply to a message with.  Typically other softwares indent a reply message and this limits how deep you can go.  Instead I suggest that when one sees a message it shows a count of how many immediate replies it has. If the user clicks the message to see the replies it moves the clicked message to the top and shows the immediate replies under it.

* So once a message is shown with its immediate child messages, if that message has a parent message, there should be a link to navigate back to the parent.  It is this mechanism which allows one to havigate as deep as one wants when replying to messages.  Without this mechanism we would run out indent space on the screen.

* Note that each message in a message thread shows the tags it has been tagged with. If there are too many tags for a certain message to display easily on a web page, there should be some form of paging.

If a message has too many child messages there should be a mechanism for paging to see further child messages.

The child messages of a parent message should be sorted by latest first.

## Notifications

When someone has a new message writen to them they should receive a notification.

I thought that a possible design could be that there is an in memory map on the backend where the key is a wallet address and the value is a boolean saying whether the user has notifications.

The idea is that a filter on the backend checks the map and digs out the boolean value and injects it into the response header:

    hasNotifications=true

Every time the frontend makes a call to create a message the logic checks if the message has a parent or not.  If it does this means a notification has to be created so the in memory map is up dated.

On the frontend side an axios interceptor intercepts the response and digs out the hasNofications header attribute.  If its value is true it pulls the notifications from the backend.

The notifications should be rendered on the frontend in a similar fashion to how youtube deals with notificiations.


# Generating profile.json specifics

The profile.json should look something like:

{
  profile-wallet-address: '<profile-wallet-address>',
  non-unique-handle: '<non-unique-handle>',
  profile-interests: ['<interest-tag>', '<interest-tag>', '<interest-tag>',],
  contacts: [
    {
      wallet-address: '<wallet-address>',
      non-unique-handle: '<non-unique-handle>',
      common-interests: [ '<interest-tag>', '<interest-tag>', '<interest-tag>',]
    }
  ]
}

Note:

* a profile can have one or more contacts
* <profile-wallet-address> is a placeholder for the actual wallet address of a profile.
* <non-unique-handle> is a placeholder for a non unique handle the user gives themself on registration
* <wallet-address> is a placeholder for the actual wallet address of a contact.
* <interest-tag> is a placeholder for an interest_tag that comes from the standing data under <project-dir>/sql/interest_tags.sql

The API should return a response which encapsulates the profile.json and the signed signature of the hash of the profile.json.

Before hashing the profile.json it should be converted to a string without any spaces.

To create the signature ECDSA should be used so that the consumer of the public api can retrieve the public key.  You may need to use a java ethers like library for that.


# JWT specifics

Ideall we also want refresh tokens.  On the frontend we should create an axiosHelper which returns secured and unsecured axios instances with interceptors in them.  The difference between a secured and unsecured instance is the secured instance injects a JWT token in the request header using the request interceptor.  

Note: 

* the response axios interceptor intercepts responses and if they have an error code it may retrieve further details of an error from the header.  

* the response axios interceptor has the navigate function passed to it which came from the useNavigate react hook.  The reason it does this is so it can for example route the user to a page which explains that they have insufficient roles to access a resource.

Note that I have provided an example axiosHelper.ts file under:

<project-dir>/example_code/axios/axiosHelper.ts


# Domain class specifics

When you generate the steps.md file please also reference this:

@../config/domain_class_specifics.md

domain_class_specifics.md specifies stuff like all domain classes should extend the Domain class which is shown in the file.


# Must NOT do

Please do not:

* automatically generate a git branch
* automatically commit code to a git branch


# Must have

Please make sure:

* All components like buttons, e.t.c should be material components from mui.com

* Before running an npm command please use nvm to make sure you are using a recent version of node.

* Before compiling java code please use the java20 alias.

Note I have the following aliases defined in ~/.zshrc

java14='export JAVA_HOME=$JAVA_14_HOME'
java16='export JAVA_HOME=$JAVA_16_HOME'
java20='export JAVA_HOME=$JAVA_20_HOME'

Please use java20 for Java


# Prefer

I prefer the following:

* As the material components have their own inline way of controlling look and feel it is best to avoid css files where possible.

* for placement of elements on the page one can use material positioning components like Grid. If using div style positioning attributes such as padding or margin, I prefer that they are included inline instead of referring to css attributes in an external file.


# Allowed

You are allowed to do:

* use the installed nvm to choose a recent version of node.  Best using recent versions of node instead of very old ones

* run npm commands for installing, running typescript checks and building. Remember to use nvm to choose the chosen version of node first.

* compliling java code. Remember to use the java20 alias to select the version of Java before compiling Java.


# Conclusion

If you have now read these instructions please now generate the plan.md file and place it in this location:

<project-directory>/.claude/commands