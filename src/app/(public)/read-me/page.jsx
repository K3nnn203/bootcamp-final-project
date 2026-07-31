import React from 'react'

export default function ReadMe() {
  return (
    <div className='p-5'>
        <h1 className='text-3xl font-bold'>X/Twitter Clone Project</h1>
        <h2 className='text-2xl font-bold mt-5 mb-2'>Project Overview</h2>
        <p>Hello users! This project is an assignment for the Frontend Bootcamp 2026 provided by Binus University.</p>
        <p>This page is dedicated for sharing information about the project/app it self. The final assignment gave three options for the type of web application to be developed.</p>
        <p>The options include:</p>
        <ul className='list-disc'>
            <li className='relative left-5'>Shopee clone - Online shopping platform</li>
            <li className='relative left-5'>X/Twitter clone - Social media platform</li>
            <li className='relative left-5'>Movie collection app</li>
        </ul>
        <p>I chose the X/Twitter clone to be my project.</p>
        <p>This project is developed by me: Kenneth Ferlianto - 2602113691</p>
        
        <h2 className='text-2xl font-bold mt-5 mb-2'>Tools, Platforms, Framework</h2>
        <h3 className='text-xl mt-2'>Next.Js</h3>
        <p>As per the requirements of the assignment, this project is made using Next.Js framework.</p>
        <h3 className='text-xl mt-2'>Firestore</h3>
        <p>As per the requirements of the assignment, this project made use of Firestore from Google Firebase as the database.</p>
        <h3 className='text-xl mt-2'>Shadcn & Lucide icons</h3>
        <p>To enhance the visuals and theme of the design, the project also utilized UI elements and themes from Shadcn and Icons from Lucide-react icons.</p>
        <h3 className='text-xl mt-2'>Cloudinary</h3>
        <p>Due to the fact that Firebase Storage is not applicable for the free plan of Google Firebase, this project instead makes use of Cloudinary for its image uploading and storage services to enable posts with images and uploading custom profile picture.</p>

        <h2 className='text-2xl font-bold mt-5 mb-2'>Pages & Features</h2>
        <p>Most of the pages and required features are available to see via this <a href="https://binusianorg.sharepoint.com/sites/SOCSEnrichment/Documents/Forms/AllItems.aspx?id=%2Fsites%2FSOCSEnrichment%2FDocuments%2F2025%2FProyek%20Inisiatif%202025%2FIT%20Bootcamp%20W72%20%28recording%2Bmateri%29%2FProyek%20Inisiatif%202025%2FIT%20bootcamp%2FFinal%20Project%20all%20track%2FFrontend%20Engineer%20Bootcamp%2Edocx%2Epdf&parent=%2Fsites%2FSOCSEnrichment%2FDocuments%2F2025%2FProyek%20Inisiatif%202025%2FIT%20Bootcamp%20W72%20%28recording%2Bmateri%29%2FProyek%20Inisiatif%202025%2FIT%20bootcamp%2FFinal%20Project%20all%20track&p=true&ga=1" className='text-blue-400'>link</a></p>
        <p>Any protected routes are not accessible if the user is unauthenticated.</p>
        <h3 className='text-xl mt-2'>Login (public route)</h3>
        <p>User can login with a registered email and password, unregistered users must first register their email.</p>
        <h3 className='text-xl mt-2'>Register (public route)</h3>
        <p>User can register their email, username, date of birth, and create their password.</p>
        <h3 className='text-xl mt-2'>Home (protected route)</h3>
        <p>This is the home feed, where user can find posts from other users that they are following. All posts can be liked or bookmarked. Clicking on a post will open the post detail page and reveal the comments/replies section.</p>
        <h3 className='text-xl mt-2'>Explore (protected route)</h3>
        <p>User can search other users by their username (not profile name). Typing into the search bar will show the top 5 users that matched the search keyword and there will be a button to show all users that matched the keyword. Clicking someone else's profile through the explore page will save it into the user's search history, which is shown in the explore page. Users also have the option to delete their search history.</p>
        <h3 className='text-xl mt-2'>Notifications (protected route)</h3>
        <p>User can see the top 10 most recent notifications. Notifications as sent when a user that they are following uploaded a post or when someone replied to their post.</p>
        <h3 className='text-xl mt-2'>Bookmarks (protected route)</h3>
        <p>User can bookmark posts by clicking on the bookmark icon. Bookmarked posts will appear on this page.</p>
        <h3 className='text-xl mt-2'>Profile (protected route)</h3>
        <p>User can view their own profile, which shows all of their posts, replies, and liked posts. User can edit their own profile (profile name and bio).</p>
        <p>User can also view other user's profile and follow them.</p>

        <h2 className='text-2xl font-bold mt-5 mb-2'>Available Users</h2>
        <p>Feel free to register a new user for yourself to use. You can also use some of the already registered users that were used for testing purposes.</p>
        <p>Here is the list for all the test user accounts along with their passwords (non of these emails and passwords are real):</p>
        <ul className='list-disc'>
            <li className='relative left-5'>
                <p>email: test3@gmail.com</p>
                <p>pass: password3</p>
            </li>
             <li className='relative left-5'>
                <p>email: test4@gmail.com</p>
                <p>pass: password3</p>
            </li>
             <li className='relative left-5'>
                <p>email: tetris@gmail.com</p>
                <p>pass: passwordtetris</p>
            </li>
             <li className='relative left-5'>
                <p>email: tom555@gmail.com</p>
                <p>pass: passwordtom</p>
            </li>
             <li className='relative left-5'>
                <p>email: teletubbies@gmail.com</p>
                <p>pass: teletubbies</p>
            </li>
        </ul>
    </div>
  )
}
