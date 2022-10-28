
import './App.css'; 
import { useState, useEffect } from 'react';
import moment from 'moment';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, onSnapshot } from "firebase/firestore";




const firebaseConfig = {
  apiKey: "AIzaSyDW0pCTqP52-kL_74oZSJ_tAwTx05vJu6I",
  authDomain: "helloworldfire-d425e.firebaseapp.com",
  projectId: "helloworldfire-d425e",
  storageBucket: "helloworldfire-d425e.appspot.com",
  messagingSenderId: "60451485396",
  appId: "1:60451485396:web:06bc964b8102bd76742d41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);



function App() {



  const [postText, setpostText] = useState("");
  const [post, setposts] = useState([]);
  const [isloading, setisloading] = useState(false);



  useEffect(() => {
    //ONE TIME READ DATA
    // const getData = async () => {
    //   const querySnapshot = await getDocs(collection(db, "post"));
    //   querySnapshot.forEach((doc) => {
    //     console.log(`${doc.id} => `, doc.data());


    //     setposts((prev) => {
    //       //Array clonning

    //       let newArray = [...prev, doc.data()];

    //       return newArray
    //     });

    //   });
    // }
   // getData();



    //REAL TIME DATA 
    let unsubscribe=null
    const getRealTimeData = () => {

      const q = query(collection(db, "post"));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const post = [];
        querySnapshot.forEach((doc) => {
          post.push(doc.data());
        });

        setposts(post);
        console.log("post:", post);
        
      });
    }
    getRealTimeData();

    //CLEAN UP FUNCTION  
    return ()=>{
      console.log("Clean up function")
      unsubscribe();
    } 

  }, [])





  const savePost = async (e) => {
    e.preventDefault();

    console.log("posttext: ", postText)
    //ADD DATA
    try {
      const docRef = await addDoc(collection(db, "post"), {
        text: postText,
        createdOn: new Date().getTime(),

      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }


  }




  return (

    <div >

      <div className='head '>

        <form className='form' onSubmit={savePost} >

          <textarea
            type="text"
            placeholder='Type something'
            onChange={(e) => { setpostText(e.target.value) }}
          />


          <button className='btn' type="submit">POST</button>
        </form>
      </div>


      <div className='mainPost'>


        {isloading ? "loading.." : ""}

        {post.map((eachPost, i) => (


          <div className='post' key={i}>

            <h3>{eachPost?.text}</h3>

            <span>{moment(eachPost?.createdOn).format('Do MMMM  YYYY, h:mm a')}</span>


          </div>
        ))}

      </div>

    </div >
  );
}

export default App;
