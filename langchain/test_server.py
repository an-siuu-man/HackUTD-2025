"""
Test script for langchain_server.py
Tests both analyzer and chatbot workflows
"""

import requests
import json

BASE_URL = "http://localhost:5000"

# Sample terms and conditions for testing
SAMPLE_TERMS = """

n8n.io
Product
Use cases
Docs
Community
Enterprise
Pricing
GitHub
154,815
Sign in
Get Started
n8n Self-Serve Terms
Back to Legal
n8n Self-Serve Terms
n8n Cloud Enterprise Terms
n8n Self-Hosted Enterprise Terms
End User License Agreement
Privacy Policy
Privacy Policy for Recruiting
Data Processing Agreement
Security
Table of content:
1. Account creation and security
2. Our workflow automation platform
3. Content on our automation platform
4. Intellectual property
5. Cancellation, Termination and Suspension
6. Indemnity
7. Liability
8. Notices
9. Governing law
PLEASE READ THESE TERMS AND CONDITIONS (“Terms”) CAREFULLY BEFORE USING THIS PLATFORM
We are n8n GmbH (registered with number HRB 212509 B) trading as n8n.

Our registered address is:
Novalisstr. 10, 10115, Berlin, Germany

If you have any questions about these Terms, please contact us at support@n8n.io.

By using our Platform you accept these Terms. If you do not agree to these Terms, you must not use our Platform.

In using our Platform we may process your personal data, more information about this can be found here.

Where you are not a consumer, you confirm that you have authority to bind the business on behalf of which you are accepting these Terms. In that context, references to “you” or “your” will be to that business. Otherwise it will refer to you, the individual entering into these Terms.

1. Account creation and security
You must create an account to use our Platform. When you register for an account on our Platform you must ensure that all information you provide to us is accurate and kept up to date. Upon registration we grant to you the personal, non-transferable right and licence to use the Platform for your own internal business purposes, until terminated as set out in these Terms.

You must keep your account details safe. Any piece of information as part of our security procedures including your username and password must be treated as confidential. We have the right to disable any user identification code or password at any time. If you know or suspect that anyone other than you knows your user identification code or password, you must promptly notify us at support@n8n.io.

These terms are binding. By using our Platform and downloading any of our Website Content you acknowledge that these terms will apply and you have legal capacity to enter into contracts in the country you live. You also confirm that when acting on behalf of a business you have authority to bind them to these terms. If this is not the case, you should not use our Platform.

Subscription fees. Where you wish to set up a paid subscription, a certain number of days will be made available to you at no cost as a free trial period. The duration of the free trial period will be clearly communicated to you in Platform. During the free trial period, the Platform will be provided to you as is, and we will not provide any guarantees or protections as to its performance or your use of it. Upon expiration of the free trial period, you will only be able to continue using the premium services if you pay the relevant fees. You will be liable to pay for all taxes and duties imposed by the relevant authorities, all prices listed on our Platform are exclusive of these.

Payment terms. Where you sign up to a monthly plan with us, all subscription fees will be payable in advance at the beginning of each month. You will be able to cancel your monthly subscription at any time which will give you access to our Platform until the end of that month, after which no further payments will be taken. If you sign up to an annual plan, this is a non-refundable payment which will be payable in advance. This will then provide you with access for a 12 month period.

Third party subscriptions. Some features on our Platform require you to have a paid subscription with third parties. These fees are separate to any monies paid to us, and you must create these accounts subject to any third party provider’s terms.

Upgrades and downgrades. Where you upgrade or downgrade the services you can access on our Platform and you are on a monthly plan, we will amend your fees payable on the next billing cycle. Where you are on an annual plan, you must pay for these in advance prior to the upgrade taking place. Please note that you will only be able to downgrade monthly services and by downgrading your services it may cause you to lose features and/ or data. We will in no way be liable for this.

In the event you exceed the limit of your current plan, we may decide to upgrade your account accordingly to facilitate your usage. We will provide you with 14 days’ notice prior to upgrading your account in which you can choose to object to this change of Platform access.

Merchant of record. Where you pay fees for the services we provide to you as part of your access to our Platform, we will use a merchant of record: Paddle, to recover these fees and any applicable taxes. Any invoices or payments from your account will be under the name “Paddle”.
2. Our workflow automation platform
What is our platform? Our “Platform” refers to our workflow automation platform and all other related services and documentation that gives you access to products and services which will automate workflows (“Website Content”), except for User Content.

User Content. You can use our Platform to create automated workflows to enable actions to take place across multiple software applications based on trigger events. In addition, you can also interact with the community by posting (including posting your workflows) on our forum (together the “User Content”).

Any workflows created on the Platform will require programming interfaces or software scripts to facilitate these transfers between applications. Our Platform also enables our users to upload their own workflows. You can also access and view User Content created and posted by others to use in your own projects as well as share your own User Content publically on the Platform, for the same purposes.

Performance of the Platform. During your use of the Platform, we will take steps to ensure that the Platform functions as described at the point you signed up. Although we will introduce technology to prevent malware and viruses we do not guarantee that our Platform will be secure or free from bugs or viruses. You are responsible for configuring your information technology, computer programmes and platform to access our Platform.

What happens when the Platform stops working as described. In the event you report to us a substantial error with the Platform, we will seek to correct this within a reasonable amount of time – where legally permitted, this will be your sole remedy.

We may suspend or withdraw our Platform. We do not guarantee that our Platform, or any of the Website Content or the User Content, will always be available or be uninterrupted. We may suspend or withdraw or restrict the availability of all or any part of our Platform for business and operational reasons.

You are also responsible for ensuring that all persons who access our Platform through your internet connection are aware of and comply with these Terms.

What action we may take in the event of a breach. When we consider that a breach of these Terms has occurred, we may take such action as we deem appropriate including:

immediate, temporary or permanent withdrawal of your right to use our Platform;

immediate, temporary or permanent removal of any User Content uploaded by you to our Platform;

legal action against you; and/or

disclosure of such information to law enforcement authorities as we reasonably feel is necessary or as required by law.

You must maintain a secure internet connection. Where you lose access to the Platform and any User Content due to a disruption in your telecommunications or internet services, we will in no way be liable for any losses suffered.

Where our Platform contains links to other sites, User Content and resources provided by third parties. These are provided for your information only. They should not be interpreted as approval by us of those linked websites or information you may obtain from them.

3. Content on our automation platform
n8n Website Content: We are the owner or the licensee of all intellectual property rights in all of the Website Content on our Platform, and in the material published on it. Those works are protected by copyright laws and treaties around the world. All such rights are reserved. You may download Website Content from our Platform for your personal use and you may draw the attention of others within your organisation to Website Content posted on our Platform. You must not modify any n8n Website Content you download.

User Content you upload to our Platform must be the following: (i) accurate (where it states facts); (ii) be genuinely held (where it states opinions); and comply with the law applicable in England and Wales.

User Content you upload to our Platform must not be the following: (i) Defamatory of anyone or could bully, insult, intimidate, discriminate or humiliate someone; (ii) unlawful; (iii) promote sexually explicit material; (iv) promote violence; (v) infringe any copyright, database right or trade mark; (vi) like to deceive; (vii) give the impression that the Services originates from us or another person for which you do not have authority from; (viii) contain any advertising or promotion for another company and/ or site; and (ix) knowingly introduce viruses, trojans, worms, logic bombs or other material that is malicious or technologically harmful.

Do not reverse engineer any of the Platform. You will not reverse engineer or otherwise attempt to derive or obtain information about the functioning, manufacture or operation of the Platform. Nor will you attempt to modify, translate, or create derivative works based on the Platform; or copy (save for archival purposes), rent, lease, distribute, pledge, assign or otherwise transfer or encumber rights to the Platform.

Internal business use only. You acknowledge and agree that you can only use the Platform for internal business purposes only and may not transfer, sell, distribute, lease, sublease, assign or licence to any third parties.

You must not attempt to gain unauthorised access. Whether this is to our Platform, the server on which our Platform is stored or any server, computer or database connected to our Platform. You must not attack our Platform via a denial-of-service attack or a distributed denial-of service attack. By breaching this provision, you would commit a criminal offence under the Computer Misuse Act 1990. We will report any such breach to the relevant law enforcement authorities and we will co-operate with those authorities by disclosing your identity to them. In the event of such a breach, your right to use our Platform will cease immediately.

4. Intellectual property
Our Platform. We are the owner or the licensee of all intellectual property rights in the Platform including any modifications and improvements, whether made by us or suggested by you. Those works are protected by copyright laws and treaties around the world. All such rights are reserved. We provide you with a worldwide, non-exclusive, non-transferable, non-sublicensable, revocable limited term licence for internal use only to use the Platform in accordance with these Terms. Such a right to use the Platform and any User Content on the Platform will expire at the point your subscription ends or when we terminate the Agreement, whichever is sooner.

Data you transmit through the Platform. All documents, messages, logos, images, files and other information you transmit through our Platform, will remain yours and you shall retain all rights, titles and interest in those. You do however provide us with a worldwide, royalty-free, non-exclusive, transferable and sublicensable right to use your data to improve our Platform.

User Content. We will retain all intellectual property rights in the User Content on the Platform, save for those created by you and our other users. We grant to you a non-exclusive licence to make, use and share User Content publically with other users via the Platform. Any User Content created by you are private, and it is your choice as to whether or not you share these with the n8n community publically to use, share and modify. You grant to us a worldwide, royalty-free, non-exclusive, transferable and sub-licensable right to use, modify and distribute any User Content you choose to share on our Platform. You acknowledge that where we create User Content materially similar to or the same as any User Content you have made public on our Platform, you will have no claims against us including for infringement or misappropriation.

5. Cancellation, Termination and Suspension
Termination of your subscription term. Your subscription will start on the date you sign up as a user of the Platform and agree to these Terms. Your access to the Platform will continue until the earlier of you cancelling your subscription; we terminate your right to access the Platform; or you commit a material breach of these Terms.

Where you wish to terminate your subscription. You can do this via the Platform or by email at: support@n8n.io.

Deletion of data. We will only retain your data for as long as we need it. Your data is usually deleted 6 months after the deactivation of your account with us, unless we are required to keep it for longer to comply with our legal, accounting or regulatory requirements. We will contact you by email 30 days before deactivating and deleting your account.

Survival of important terms. Please note that all rights under this Agreement, which by nature should survive termination, will, including Indemnity, Liability, Governing Law, Notices and Intellectual Property.

6. Indemnity
Your indemnity to us. You agree to indemnify us, our affiliates, directors, officers and employees against all loss, costs, damages liabilities and expenses that arise out of your breach of these Terms and/ or use of the Platform.
7. Liability
We do not limit any losses that we are not allowed to limit: We do not exclude or limit in any way our liability to you where it would be unlawful to do so including death or personal injury caused by our negligence.

What we do limit: We exclude all implied conditions, warranties, representations or other terms that may apply to our Platform or any Services on it. We will not be liable to you for any loss or damage, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, even if foreseeable, arising under or in connection with the use of, or inability to use, our Platform; or use of or reliance on any Services displayed on our Platform.

In particular, we will not be liable for loss of profits, sales, business, or revenue; business interruption; loss of anticipated savings; loss of business opportunity, goodwill or reputation; or any indirect or consequential loss or damage.

No Services guarantees. The Platform is provided “as is”. We make no guarantee as to the quality of the Platform and its suitability for your individual purposes, and will not be liable in the event you do not undertake your own prior due diligence.

Severability. Each of the paragraphs of these terms operates separately. If any court or relevant authority decides that any of them are unlawful or unenforceable, the remaining paragraphs will remain in full force and effect.

8. Notices
Where do we issue notices to you. We will issue all notices to you via the Platform save for any that will materially impact your rights or your use of the Platform which we will email to you, via the email you use to subscribe to the Platform.

Complaints and legal disputes. Where you have any complaints, are subject to insolvency (or similar) proceedings or wish to issue legal proceedings against us, you should send notice of these to:

n8n GmbH
Novalisstr. 10
10115 Berlin
Germany

9. Governing law
What laws apply to these Terms? These terms are governed by English law and you can bring legal proceedings in the English courts.
However if you are a consumer you may also benefit from any mandatory provisions of the law of the country in which you are resident. Nothing in these Terms affects your rights as a consumer to rely on such mandatory provisions of local law.

Changes to these Terms. As our service grows and improves, we might have to make changes to these Terms. We will do this by uploading the latest version with a date confirming when they went live.
Last updated in July 2020

n8n.io
Automate without limits






Careers
Hiring
Contact
Merch
Press
Legal
Case Studies
Zapier vs n8n
Make vs n8n
Tools
AI agent report
Affiliate program
Expert partners
Join user tests, get a gift
Events
Brand Guideline
Popular integrations
Google Sheets
Telegram
MySQL
Slack
Discord
Postgres
Show more
Trending combinations
HubSpot and Salesforce
Twilio and WhatsApp
GitHub and Jira
Asana and Slack
Asana and Salesforce
Jira and Slack
Show more
Top integration categories
Communication
Development
Cybersecurity
AI
Data & Storage
Marketing
Show more
Trending templates
Creating an API endpoint
AI agent chat
Scrape and summarize webpages with AI
Joining different datasets
Back Up Your n8n Workflows To Github
Very quick quickstart
Show more
Top guides
Telegram bots
Open-source chatbot
Open-source LLM
Open-source low-code platforms
Zapier alternatives
Make vs Zapier
Show more
Imprint
|
Security
|
Privacy
|
Report a vulnerability

© 2025 n8n   |   All rights reserved.

;


n8n.io
Product
Use cases
Docs
Community
Enterprise
Pricing
GitHub
154,815
Sign in
Get Started
n8n Privacy Policy
Back to Legal
n8n Self-Serve Terms
n8n Cloud Enterprise Terms
n8n Self-Hosted Enterprise Terms
End User License Agreement
Privacy Policy
Privacy Policy for Recruiting
Data Processing Agreement
Security
Table of content:
1. How do we use your data?
2. Where is my data stored?
3. How long do we keep your data for?
4. What are my rights under data protection laws?
5. Questions, comments and more detail
We are n8n GmbH (registered with number HRB 212509 B) trading as n8n.

Our registered address is:
Novalisstr. 10
10115 Berlin
Germany

If you have any questions about this privacy notice, including any requests to exercise your legal rights, please contact us at privacy@n8n.io.

1. How do we use your data?
When you register for n8n cloud. When you sign up for an account with us, we collect your name and email. We collect these details to put the contract in place between us that enables you to access our platform. We use PostHog in order to better understand how people use our product and to optimize our service and experience. You can click here to learn more about PostHog. Additional data including address and credit card information will be collected by our Merchant of Record, Paddle, in order to process your payment. We do not use any personal data, including data received through any third-party services, for developing, improving, or training AI and/or ML models. We do not transfer or disclose your information to third parties for purposes other than the ones provided. You can delete your n8n cloud account via the product. You can learn more about the data we collect on cloud in our docs.

When you use/run your own n8n deployment. If you install n8n on your own server, and you opt-in, we collect your email address, and may use it to contact you about your usage of the product. If you sign up for a paid plan, we collect your name, email address, company address, and the name and email address of others in your company (e.g. a billing contact). We collect these details to put a contract in place between us. If you use our credit card billing feature, our Merchant of Record, Paddle, collects information including your address and credit card information, in order to process your payment. In addition, we collect selected, anonymous information about how n8n is used. We use this information to improve your experience with our services and to protect from potential security attacks and abuse. We do not use any personal data, including data received through any third-party services, for developing, improving, or training AI and/or ML models. We do not transfer or disclose your information to third parties for purposes other than the ones provided. You can learn more about the data we collect, and how to disable this information collection in our docs.

When you sign up for the community forum. We collect your email address or social media handle in order to assign you with an account to use our forum. You can delete your forum account by emailing us at privacy@n8n.io.

When you attend one of our events or a third party event. When you attend one of our events or a third party event, we may collect your personal information including your name, address, email address and phone number. We collect this information because it’s in our legitimate interests to know who’s attending our events and to help promote our business at third party events. Where you attend one of our events we may take pictures or videos of you. We do this as we have a legitimate interest to promote our business. You can opt out of having your photo taken in this way both when you attend our events and at any time by contacting us at privacy@n8n.io.

When you contact us. When you contact us either by email or via our website or product with general queries, we will usually collect your name and contact details, because it’s in our legitimate interest to make sure we can properly respond to your query.

On social media. When you connect with us on social media including on Facebook, Twitter, YouTube and LinkedIn we will process your handle, name and email address under our legitimate interest to respond to your comments and queries promptly.

When you receive our news updates. We will handle your personal information (such as your name and email address) to provide you with our news updates in line with any preferences you have told us about.
When we send you our news updates because you have opted-in to receive them, we rely on your consent to contact you. If you have not opted-in and we send you our news updates emails, we do this because of our legitimate interest to promote our business.
You can unsubscribe from our updates at any time by clicking the unsubscribe link at the bottom of any of our emails, or by emailing privacy@n8n.io.

When you register as an expert. We collect your name, email address, and details about your company in order to communicate with you about the n8n expert program.

When you register as an affiliate. We collect your name and email address in order to communicate with you about the n8n affiliate program.

Technical information when you use our website. When you consent, we collect information about how you use our website. We use this information to improve our website and to better understand how people use it. More detail on the information we collect and how we do this is set out in our cookie policy. If you have given consent to the use of cookies, we will use Google Analytics in order to better understand our users’ needs and to optimize our service and experience. You can click here to learn more about how Google uses this data.

When you apply for a job with us. When you enter into the recruitment process with us we may collect your name, contact details, recruitment information (e.g. right to work documentation and references), qualifications, accreditations, test results (inc. psychometric and coding) and any additional information we may receive from our recruitment partners.
We will use your personal information to assess your suitability for our available roles. We do this to perform a contract or to take steps at your request, before entering into a contract. Where we process your right to work documentation, we will do so to comply with our legal obligations.

If our business is sold. We process your personal information for this purpose because we have a legitimate interest to ensure our business can be continued by the buyer. If you object to our use of your personal information in this way, the buyer of our business may not be able to provide services to you.

2. Where is my data stored?
We store your data in the EU.

Whenever we transfer your personal information outside of the EU, we ensure it receives additional protection as required by law. To keep this privacy policy as short and easy to understand as possible, we haven’t set out the specific circumstances when each of these protection measures are used. You can contact us at privacy@n8n.io for more detail on this.

3. How long do we keep your data for?
We store your personal information for no longer than necessary for the purposes for which it was collected, including for the purposes of satisfying any legal or reporting requirements, and in accordance with our legal obligations and legitimate business interests. To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data; the potential risk of harm from unauthorized use or disclosure of your personal data; the purposes for which we process your personal data; and the applicable legal requirements.

In some circumstances we may carefully anonymise your personal data so that it can no longer be associated with you, and we may use this anonymised information indefinitely without notifying you. We use this anonymised information to analyse our programmes and support other similar programmes around the world.

4. What are my rights under data protection laws?
You have various other rights under applicable data protection laws, including the right to:

access your personal data (also known as a “subject access request”)
correct incomplete or inaccurate data we hold about you
ask us to erase the personal data we hold about you
ask us to restrict our handling of your personal data
ask us to transfer your personal data to a third party
object to how we are using your personal data
withdraw your consent to us handling your personal data
You also have the right to lodge a complaint with your relevant supervisory authority, you can find which one applies to you here.

Please keep in mind that privacy law is complicated, and these rights will not always be available to you all of the time.

5. Questions, comments and more detail
Your feedback and suggestions on this notice are welcome.

More information about n8n's data privacy practices, including GDPR compliance, data processing agreements, sub-processors, data collection, and AI integration, with distinctions between n8n Cloud and self-hosted versions is here.

We’ve worked hard to create a notice that’s easy to read and clear. But if you feel that we have overlooked an important perspective or used language which you think we could improve, please let us know by email at privacy@n8n.io.

This privacy policy was last updated on the 11th of November 2024.

n8n.io
Automate without limits






Careers
Hiring
Contact
Merch
Press
Legal
Case Studies
Zapier vs n8n
Make vs n8n
Tools
AI agent report
Affiliate program
Expert partners
Join user tests, get a gift
Events
Brand Guideline
Popular integrations
Google Sheets
Telegram
MySQL
Slack
Discord
Postgres
Show more
Trending combinations
HubSpot and Salesforce
Twilio and WhatsApp
GitHub and Jira
Asana and Slack
Asana and Salesforce
Jira and Slack
Show more
Top integration categories
Communication
Development
Cybersecurity
AI
Data & Storage
Marketing
Show more
Trending templates
Creating an API endpoint
AI agent chat
Scrape and summarize webpages with AI
Joining different datasets
Back Up Your n8n Workflows To Github
Very quick quickstart
Show more
Top guides
Telegram bots
Open-source chatbot
Open-source LLM
Open-source low-code platforms
Zapier alternatives
Make vs Zapier
Show more
Imprint
|
Security
|
Privacy
|
Report a vulnerability

© 2025 n8n   |   All rights reserved.

;

"""

def test_health():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_analyzer():
    """Test the analyzer workflow"""
    print("\n" + "="*60)
    print("TEST 2: Terms Analyzer")
    print("="*60)
    
    payload = {
        "terms_data": SAMPLE_TERMS
    }
    
    response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n📊 SCORE: {result['score']}/100\n")
        
        print("📋 ANALYSIS:")
        for item in result['all_analysis']:
            flag_emoji = {
                'info': 'ℹ️',
                'critical': '🚨',
                'warning': '⚠️',
                'good': '✅'
            }.get(item['flag'], '❓')
            
            print(f"\n{flag_emoji} [{item['flag'].upper()}] {item['title']}")
            print(f"   {item['analysis'][:150]}...")
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_chatbot():
    """Test the chatbot workflow"""
    print("\n" + "="*60)
    print("TEST 3: Chatbot Q&A")
    print("="*60)
    
    # Start a conversation
    conversation_id = None
    
    questions = [
        "What data do you collect?",
        "Can I cancel my subscription anytime?",
        "What happens if there's a dispute?"
    ]
    
    for i, question in enumerate(questions, 1):
        print(f"\n💬 Question {i}: {question}")
        
        payload = {
            "terms_data": SAMPLE_TERMS,
            "message": question
        }
        
        if conversation_id:
            payload["conversation_id"] = conversation_id
        
        response = requests.post(f"{BASE_URL}/api/chatbot", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            conversation_id = result['conversation_id']
            print(f"🤖 Answer: {result['response']}\n")
        else:
            print(f"Error: {response.text}")
            return False
    
    # Test conversation history
    print("\n" + "="*60)
    print("TEST 4: Conversation History")
    print("="*60)
    
    response = requests.post(
        f"{BASE_URL}/api/chatbot/history",
        json={"conversation_id": conversation_id}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Conversation ID: {result['conversation_id']}")
        print(f"Message Count: {result['message_count']}")
        print(f"History: {len(result['history'])} messages stored")
    
    return True

def test_conversation_reset():
    """Test conversation reset"""
    print("\n" + "="*60)
    print("TEST 5: Conversation Reset")
    print("="*60)
    
    # Create a conversation
    payload = {
        "terms_data": SAMPLE_TERMS,
        "message": "Hello"
    }
    
    response = requests.post(f"{BASE_URL}/api/chatbot", json=payload)
    conv_id = response.json()['conversation_id']
    
    # Reset it
    response = requests.post(
        f"{BASE_URL}/api/chatbot/reset",
        json={"conversation_id": conv_id}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def run_all_tests():
    """Run all tests"""
    print("\n" + "🧪 LANGCHAIN SERVER TEST SUITE")
    print("="*60)
    print("Make sure the server is running: python langchain_server.py")
    print("="*60)
    
    tests = [
        ("Health Check", test_health),
        ("Analyzer", test_analyzer),
        ("Chatbot", test_chatbot),
        ("Conversation Reset", test_conversation_reset)
    ]
    
    results = []
    
    try:
        for name, test_func in tests:
            try:
                result = test_func()
                results.append((name, result))
            except requests.exceptions.ConnectionError:
                print(f"\n❌ Cannot connect to server at {BASE_URL}")
                print("Make sure the server is running!")
                return
            except Exception as e:
                print(f"\n❌ Test '{name}' failed with error: {e}")
                results.append((name, False))
        
        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        for name, result in results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{status} - {name}")
        
        passed = sum(1 for _, r in results if r)
        total = len(results)
        print(f"\n{passed}/{total} tests passed")
        
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")

if __name__ == "__main__":
    run_all_tests()
