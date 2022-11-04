
import './App.css';
import { useState, useEffect } from 'react';
import moment from 'moment';
import axios from "axios";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, query, onSnapshot, serverTimestamp, orderBy, deleteDoc, updateDoc } from "firebase/firestore";




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
  const [file, setFile] = useState(null);
  // const [IsEditing, setIsEditing] = useState(null);
  // const [EditingText, setEditingText] = useState("");

  const [Editing, setEditing] = useState({
    editingId: null,
    editingText: " "
  })


  const formik = useFormik({
    initialValues: {
      text: ""
    },
    validationSchema: yup.object({
      text: yup
        .string('Enter Title')
        .required('Title is required'),
    }),
    onSubmit: async (values) => {

      const cloudinaryData = new FormData();
      cloudinaryData.append("file", file);
      cloudinaryData.append("upload_preset", "uploadedPic");
      cloudinaryData.append("cloud_name", "diq617ttx");
      console.log(cloudinaryData);


      axios.post(` https://api.cloudinary.com/v1_1/diq617ttx/image/upload`,cloudinaryData, 
      {
        headers: {'Content-Type': 'multipart/form-data' }
      })
        .then(async res => {
          
          console.log("from then", res.data );

          console.log("values", values)
          try {
            const docRef = await addDoc(collection(db, "post"), {
              text: values.text,
              img: res?.data?.url,
              createdOn: serverTimestamp()

            });
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        
        })
        .catch(err => {
          console.log("from catch", err);
        })




    },
  });






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
    let unsubscribe = null
    const getRealTimeData = () => {

      const q = query(collection(db, "post"), orderBy("createdOn", "desc"));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const post = [];
        querySnapshot.forEach((doc) => {
          // post.push(doc.data());

          let data = doc.data()
          data.id = doc.id

          post.push(data);

        });

        setposts(post);
        console.log("post:", post);

      });
    }
    getRealTimeData();

    //CLEAN UP FUNCTION  
    return () => {
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
        createdOn: serverTimestamp()

      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }


  }

  const deletePost = async (postId) => {

    console.log("postid", postId)

    await deleteDoc(doc(db, "post", postId));

  }

  const updatePost = async (e) => {

    e.preventDefault();

    await updateDoc(doc(db, "post", Editing.editingId), {
      text: Editing.editingText
    });

    setEditing({
      editingId: null,
      editingText: ""
    })

  }


  // const edit = (postId,text) => {

  //   const updateState =
  //     post.map(eachItem => {
  //       if (eachItem.id === postId) {
  //         return { ...eachItem, IsEditing: !eachItem.IsEditing }
  //       }
  //       else {
  //         return eachItem
  //       }
  //     })

  //   setposts(updateState)
  // }


  return (

    <div >

      <div className='head '>

        <form className='form' onSubmit={formik.handleSubmit} >

          <textarea
            value={formik.values.text}
            name="text"
            type="text"
            placeholder='Type something'
            onChange={formik.handleChange}
          />
          {/* <span style={{color: "red"}}>{formik.touched.text && formik.errors.text}</span> */}
          

        {/* upload photo */}
          <input
            type="file"
            name="uploadedPic"
            onChange={(e)=>{
              setFile ( e.currentTarget.files[0])
            }}>
          </input>


          <button className='btn' type="submit">POST</button>
        </form>
      </div>


      <div className='mainPost'>



        {post.map((eachPost, i) => (


          <div className='post' key={i}>

            <h3>{(eachPost.id == Editing.editingId) ?

              <form onSubmit={updatePost}>

                <input type="text"
                  value={Editing.editingText}
                  onChange={(e) => {
                    setEditing({
                      ...Editing,
                      editingText: e.target.value
                    })
                  }}
                  placeholder="Please enter updated value" />

                <button type='Submit' >Update</button>

              </form>
              : eachPost?.text}
            </h3>




            {/*      terniray operator */}
            <span>{moment((eachPost?.createdOn?.seconds * 1000) ? eachPost?.createdOn?.seconds * 1000
              :
              undefined)
              .format('Do MMMM  YYYY, h:mm a')}</span>

            <img src={eachPost?.img} alt=""></img>

            <br />
            <br />

              

            {/* Delete button */}
            <button onClick={() => {
              deletePost(eachPost?.id)
            }}>
              Delete</button>


            {/* edit button */}
            {(Editing.editingId === eachPost?.id) ? null :
              <button
                onClick={() => {
                  setEditing({
                    ...Editing,
                    editingId: eachPost?.id,
                    editingText: eachPost?.text
                  })
                }}
              >Edit </button>

            }


          </div>
        ))}

      </div>

    </div >
  );
}

export default App;
