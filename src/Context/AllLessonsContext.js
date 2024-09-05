
import React, { createContext, useState, useContext, useEffect } from 'react';

const AllLessonsContext = createContext();

export const AllLessonsProvider = ({ children }) => {
    
    const [allLessons,setAllLessons]=useState(null)
    const [startCompleted,setStartCompleted]=useState(false)
    const [completedUpto,setCompletedUpto]=useState("");
    const [singleArray,setSingleArray]=useState(null)

    const updateSuccess=(id)=>{
      const temp=allLessons;
      for (let i = 0; i < temp.length; i++) {
        const view = temp[i];
        for (let j = 0; j < view.lessons.length; j++) {
          const lesson = view.lessons[j];
          console.log(lesson.id,id)
          if (lesson.id === id) {
              temp[i].lessons[j].success=1;
              console.log("TEMP CURR",temp[i].lessons[j])
              if(j+1<temp[i].lessons.length){
                  temp[i].lessons[j+1].locked=false;
                  console.log("TEMP NEXT",temp[i].lessons[j+1])
              }
          }
        }
      }
      setAllLessons(temp)
      
    }
    const updateLessons=(data)=>{
        setAllLessons(()=>data)
    }
   
    const updateSingleArray=(data)=>{
      setSingleArray(data)
    }
    const getLevelData=(level)=>{
        return allLessons.find(item => item.view_number === level);
    }
    
    return (
      <AllLessonsContext.Provider value={{ allLessons,updateSuccess, updateLessons,startCompleted,setStartCompleted,completedUpto,setCompletedUpto,singleArray,updateSingleArray }}>
        {children}
      </AllLessonsContext.Provider>
    );
  };

  // Custom hook to use the AuthContext
export const useAllLessons = () => {
    return useContext(AllLessonsContext);
  };