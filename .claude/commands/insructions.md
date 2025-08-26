# Introduction

This file has my requirements. 

I want you to generate a plan.md of the necessary steps to generate the code.  The plan.md file shoould be generated to the following directory:

<project-directory>/.claude/commands

This is the same directory where this instructions.md file is located.

Note I will later be executing the plan.md file using claude.


# High Level Description of Software

I want to create a website called "My Interests".  It is website where you can go and register and choose what your interests are.  You can then search for those who have similar interests and make friend requests to them.  

When they accept your friend request you are now connected via your common interests and you can communicate with them via direct private message board threads or public message board threads based on interests. Note the details are shown in subsequent sections.

When you register your identity key is your wallet address.  As we are using Reown's App Kit Account abstraction the user does not need to install a wallet like Metamask as they can instead use Reown's own Account Absraction wallet.  Behind the scenes the account abstraction of Reown's App Kit shares the private key fragments in such a way that no single user storing the private key fragments can use the private key for signing.  Only the rightful owner of the key can sign.  This allows a web 2 user who has not installed a wallet to be allocated a wallet behind the scenes.  However web 3 users can use their ethereum compatible wallet.

Each user of the "My Interets" website has a profile which captures their connections based on interests.  The data to create the profile is stored in the postgres database.  When the profile is generated for external use, the profile is created in json format.

"My Interests" exposes an api where a request can be made to retrieve the profile of a user if the wallet address is known for that user.  One needs a client-id to be able to call the "Profile API". 

Before being able to call the "Profile API", the client needs to authenticate against the "Profile API".


# Tech stack

Frontend for Interests website:

* React using vite
* Only use Material design components from mui.com. 
* For crypto wallet management use Reown's App Kit.

Backend for Interests website:

* Java Spring Boot backend using Spring Security, Hibernate and a postgres database

Client code for accessing "ProfileAPI":

* Java Spring Boot using http client to acccess "Profile API"


# Lombok

I want to use Lombok which with the help of annotations can generate boiler plate code.


# Project structure

I want the project structure to be like the following:

    <project-dir>/frontend
    <project-dir>/backend
    <project-dir>/profile-api-client

The react code goes under the frontend directory while the Spring Boot Code goes under the backend directory.

The profile-api-client directory contains Java Spring Boot code for the caller of the "Profile API" to authenticate and retrieve the profile.json file for a specific wallet address.  Once authenticated the client is issued with a JWT token to pass in the header when retrieving a profile.json file.


# Registering and Login specifics

When registering, the software is using Reown's App Kit.  If they choose to register using 
App Kit's account abstraction then a wallet address will be created for them.

When the user registers they should select their country and their interests.

This sql file contains the country data:

    <project-dir>/sql/continents_countries.sql

This sql file contains the interest data:

    <project-dir>/sql/interest_tags.sql

When generating the spring boot domain classes you need to take a look at the above 2 sql
files.

So once registered, the postgres database will contain this data:

* the wallet address of the user
* the interests of the user
* the country they belong to
* optionally some location tags for nearby locations.  For example they may tag their location with the town or nearest city name.  These tags are not in standing data.
* a handle name which need not be unique.  Note the main identifier is the wallet address.

Once the user has registered the spring boot backend sends a JWT token to the frontend.

Ideally the code should also support refresh and the main JWT tokens on both the backend and frontend.

When logging in the user needs to first of all connect using their wallet or the account abstraction wallet.  They are then issued a JWT token which should be stored in the react frontend.  They should use the JWT token when calling backend APIs.

Note that there should be checks for the token on the frontend such as whether the token has expired or not.  If it is expired but they are still connected to the frontend via their wallet or account abstraction wallet, a request should be made to get a new token.

If when calling a backend api to do something like find users to connect to, they may not have the necessary Roles to access the Spring Boot method using the JWT token.  The backend should communicate the problem to the frontend so the frontend can show the right error message or request the user to connect again.

Note that the user could be connected but possibly the token expired.  Or they might not have the correct Spring Security roles allocated to them yet to access the API.

Note that after registering the user should be able to edit details they registered with.  The only thing they cannot change is their wallet address.

Note that if they in the processing of removing interests they registered with the following logic needs to be respected:

If removing an interest means they would be left with a connection that has no interess in common, then they should be notified when removing an interest that it will also delete all connections where there are no longer any interests in common.


# Connecting to friends specifics

The frontend should allow registered users to search for other users to connect to on the basis of interests and optionally location tags.  As mentioned above a user can add tags for their location on registering.  The location tag may be the name of the nearest town or city but it need not be. 

A user makes a friend request to connect to another user on the basis of common interests.  The other user can dismiss the friend request or accept it.

If user Alice wants to connect to user Bob and Bob is already connected to some of Alice's existing connections, then this should be shown to Alice before making the friend request to Bob.


# Communicating with connections specifics

A connection is someone who has accepted a friend request.

## Private Message Thread specifics

Once a user has registered, they can make friend requests and have them accepted.  Once connected a user can communicate with another user via a private message thread.  A private message thread has a subject.

## Public Message Thread specifics

A registered user can also create a public message thread with the following functionality:

* The user tags the public message thread with interest tags they already have.  Some of these interest tags were chosen when they registered but as mentioned else where they can edit any registration detail apart from their wallet address after being registered.

* Anyone can search for public message threads on the basis of a subset of interest tags they already have.

* In the search results they can click to be taken to the public message thread.

* Once at the public message thread, a user can tag a message with a tag.  These tags can be anything the user wants.  Others can filter messages in a public message thread on the basis of the tags.  One can decide to filter out messages which have a certain tag or one can decide to only see messages which have been tagged with a certain tag.  When deciding on what tag to tag a message with a user can type the name of the tag in a box and existing tags which have a similar spelling can be displayed. This allows a user who wants to tag something, to refine their tag name or use an existing one that was created by someone else.

* a user can reply to another message in the message thread.  There is no limit to how deep in the message tree you can reply to a message with.  Typically other softwares indent a reply message and limit how deep you can go.  Instead I suggest that when one sees a message it shows a count of how many immediate replies it has and that if you click to see the replies it shows the original message at the top with the immediate replies under it. If there are too many child messages it should support paging.  

* So once a message is shown with its immediate child messages, if that message has a parent message, there should be a link to navigate back to the parent.  It is this mechanism which means we can go as deep as we want in replying to messages.  Without this mechanism we would run out indent space on the screen.

* Note that each message in a message thread shows the tags it has been tagged with. If there are too many tags for a certain message to display easily on a web page, there should be some form of paging.


## Notifications

When someone has a new message writen to them they should receive a notification.

I thought that a possible design could be that there is an in memory map on the backend where the key is a wallet address and the value is a boolean saying whether the user has notifications.

The idea is that a filter on the backend checks the map and digs out the boolean value and injects it into the response header:

    hasNotifications=true

Every time an api method is called which is a new private message or a response to a private or public message thread then the in memory map is updated.

On the frontend side an axios interceptor intercepts the response and digs out the hasNofications header attribute.  If its value is true it pulls the notifications from the backend.

The notifications should be rendered on the frontend in a similar fashion to youtube notificiations.


# Generating profile.json specifics

The profile.json should look something like:

{
  profile-wallet-address: '<profile-wallet-address>',
  non-unique-handle: '<non-unique-handle>'
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

To create the signature ECDSA should be used so that the consumer of the public api can retrieve the public key.


# Domain class specifics

When you generate the steps.md file please also reference this:

@../config/domain_class_specifics.md


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
