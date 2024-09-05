import { API_BASE_URL } from "../config";

const getLessonType=async(id)=>{
    try {
        const response = await fetch(`${API_BASE_URL}/get_standard_id`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
          });
          // console.log("Waiting for lesson info");
          const data = await response.json();
          const beats= data.data.Beats
          console.log(beats)
          if(beats==0 || beats==null)
                return "without"
          else
            return "with";
        
    } catch (error) {   
            console.log("ERROR IN FETCHING LESSONS")
    }
}
export {
    getLessonType
}