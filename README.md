## Inspiration
When was the last time you read any terms of service or policy document? It is a guaranteed answer: never. A 2019 Pew Research Center study found that only 9% of U.S. adults say they "always" read a company's privacy policy before agreeing to it. Unknowingly, we give access to all our data, our pictures, and whatever we share online to the big companies. If there is any misuse or data breach online, we no longer hold any right to bring companies to court because we chose to skip reading through the terms and conditions, as it was too long for our eyes.  Plagued by the problem of not encouraging ourselves to go through the lengthy lines of terms and rules, we decided to make a creative solution to ease the discomfort of looking through long pages of company policies. You can easily summarize the details of the terms and sign the policies **On Your Terms** 


## What it does
**On Your Terms** gives you a summarized view of companies' policies of data use and ranks the seriousness of the contract(s) with the score associated with them. This tool sits on your browser as an extension, scanning and flagging any hyperlinks containing company policy and terms. The tool analyzes the hidden contract terms in the background and assigns a score on how seriously you need to take the terms while committing to them. Don't worry if the contract document has a seriously low score ; you don't need to go through a 10-page-long contract. The tool also highlights the major points that need consideration on the side window. On Your Terms takes full care of its users by providing _one-on-one_ chat to further explain policy points where you need more assistance understanding the terms.

## How we built it
We automated the whole process of scanning the website, flagging the hyperlinks, analyzing the terms, and providing chat assistance with the n8n workflow automation tool in the background. The browser extension built on manifest.json sits at the frontend, scanning and interacting with the user on chat, while the automation workflow sits at the backend, acting on trigger events to parse data from the frontend, storing it in a database, passing back the score to the frontend, allowing the user to interact with NVIDIA's Nemotron agentic AI if the user chooses to. We had a seamless integration of a browser extension, a safe database, and a robust AI chatbot using LangChain, solving the tedious task of reading terms and conditions in minutes instead of hours.
 

## Challenges we ran into
It was our first time working with a browser extension, n8n automation workflow, and LangChain. We encountered errors with data mismatch while implementing these tools, but they weren't that tough to handle. We had major trouble working with the browser extension. Since the browser extension doesn't allow the use of a library like Selenium to scrape the data on the website in the background, we spent a long time before we were able to scrape and send the scraped data to the endpoint. We had another big trouble routing the scraped data to the LangChain. We faced some trouble while integrating all the tools on the n8n automation tool as well, due to differences in the expected and delivered data types. We were able to tackle all the errors with localized debugging and gradually integrate the whole tool chains to put a robust model.

## Accomplishments that we're proud of
We are proud that we were able to solve the problem we face every day, but we casually choose to ignore it. We couldn't think of a better use of AI than to make tedious tasks easier and prevent everyone from silent privacy invasion. Making a fully working system that brings different tech into a single automated integration to tackle a normal person faces on a daily basis is what we expected to gain from this hackathon.  Besides, we also got to learn so many new tools like LangChain, n8n automation, and building a browser extension. Overall, it has been a 10/10 project based on the complexity of the problem statement, impact on daily life, and learning outcomes.

## What we learned
Besides the website designing tool, every tool we used was new for us. We learned LangChain, building a browser extension, n8n automation, mand aking an AI chatbot. 

## What's next for On Your Terms
We can expand the scope of On your Terms in following ways:
1. Making an individualized chatbot for each user along with all the interaction history to provide more context.
2. Expanding the use case of tool beyond just terms and conditions and policies link. 
