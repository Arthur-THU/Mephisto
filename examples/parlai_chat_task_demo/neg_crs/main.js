/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";
import ReactDOM from "react-dom";
import "bootstrap-chat/styles.css";
import { FormGroup, FormControl, Button, Radio} from "react-bootstrap";
import { ChatApp, DefaultTaskDescription, INPUT_MODE } from "bootstrap-chat";
import rec_list from "/home/mawenchang/Mephisto/examples/parlai_chat_task_demo/custom_input_and_messages/data.js";

/*
This example modifies the default parlai_chat example to demonstrate
how one can override the default visual implementations for the
chat message bubble and the response input bar, while coordinating
behavior between them with global state.

In this example we add a radio button group to each received chat message.
Additionally, we require the user to make a selection for the most
recently received chat message, before they can submit their own message
by modifying the input bar code.

This example is for illustrative purposes only and has not been tested
with production usage.
*/


function ChatMessage({ isSelf, idx, agentName, message = "", onRadioChange }) {
  const floatToSide = isSelf ? "right" : "left";
  const alertStyle = isSelf ? "alert-info" : "alert-warning";

  const handleChange = (e) => {
    onRadioChange(e.currentTarget.value, e.currentTarget.name);
  };

  
  return (
    <div className="row" style={{ marginLeft: "0", marginRight: "0" }}>
      <div
        className={"alert message " + alertStyle}
        role="alert"
        style={{ float: floatToSide }}
      >
        <span style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>
          <b>{agentName}</b>: {message}
        </span>
        {isSelf ? null : (
          <FormGroup>
            <Radio
              name={"radio" + idx}
              value={"Pos"}
              onChange={handleChange}
            >
              Positive
            </Radio>{" "}
            <Radio
              name={"radio" + idx}
              value={"Neg"}
              onChange={handleChange}
            >
              Negative
            </Radio>{" "}

            <Radio
              name={"radio" + idx}
              value={"None"}
              onChange={handleChange}
            >
              None
            </Radio>{" "}
          </FormGroup>
        )}
      </div>
    </div>
  );
}

function RenderChatMessage({
  message,
  mephistoContext,
  appContext,
  idx,
  onRadioChange,
}) {
  const { agentId } = mephistoContext;
  const { currentAgentNames } = appContext.taskContext;

  return (
    <div>
      <ChatMessage
        idx={idx}
        isSelf={message.id === agentId || message.id in currentAgentNames}
        agentName={
          message.id in currentAgentNames
            ? currentAgentNames[message.id]
            : message.id
        }
        message={message.text}
        taskData={message.task_data}
        messageId={message.message_id}
        onRadioChange={onRadioChange}
      />
    </div>
  );
}


function SearchBar({onClick}) {

  const getSearchResult = React.useCallback(() => {
    var show =document.getElementById('show');
    var val = document.getElementById('val');
    show.style.display = 'block';

    var str = '';
    for(let i = 0; i < rec_list.length; i++)
    {
        if(rec_list[i].indexOf(val.value) != -1)
        {
          // alert(array[i])
          str += "<li>"+rec_list[i]+"</li>";
        }
            

    }
    if(!val.value || !str)
        show.innerHTML = "<ul><li>no movie found...</li></ul>";
    else
        show.innerHTML = "<ul>"+str+"</ul>";

    var arrayList = show.getElementsByTagName("li");
    for(let i = 0; i < arrayList.length; i++)
    {
        arrayList[i].addEventListener('click',function(){
            onClick(arrayList[i].innerText,"add")
        });
    }   
  }, []);

  const onBlurEffect = React.useCallback(() => {
    var val = document.getElementById('val');
    var show = document.getElementById('show');
    val.value = "";
    show.style.display = 'none';
  },[])

  
  return (
      <div>
        <p>Search and select the movies to recommend here:</p>
        <style>
          {`
              ul{
                list-style: none;
                margin:0px;
                padding:0px;
              }
              li{
                border:black 1px solid;
                width:250px;
                margin:0px;
                padding:0px;
              }
              input{
                width:250px;
              }`
          }
        </style>
        <div className="box" style={{zIndex:100,backgroundColor:'white',position:'absolute'}}>
          <div className="search">
            <input type="text"
            id="val"
            placeholder="Search movies to recommend..." 
            onKeyUp={()=>getSearchResult()}
            onBlur={()=>onBlurEffect()}/>           
          </div>
          <div className="show" id = "show">
          </div>
        </div>
      </div>
  );
}

function RenderSeekerInfo(seeker_profile) {
  const like_genres = seeker_profile.like_genres.map((genre) =>
    <li key={genre}>
      {genre}
    </li>)
  const dislike_genres = seeker_profile.dislike_genres.map((genre) =>
    <li key={genre}>
      {genre}
    </li>)
  return (
    <div>
      <p>You are seeking for recommendation for movies. You will chat with a recommender, who will make recommendation. Below are your characteristics. Your dialogue must be consistent with the provided characteristics.</p>
      <p>You must strictly follow the instructions below, or your HIT will be rejected:</p>
      <p>1.Whenever you mention a movie, you should <strong>wrap it with dollar signs</strong>. For example, you can say "I like <strong>$Titanic$</strong> very much!"</p>
      <p>2.You cannot directly tell that what genres of movies you like or dislike unless you are recommended such a movie.</p>
      <hr style={{ color: "black" }} />
      <p>Ok case:</p>
      <p>Recommender: I think $Titanic$ is a very good movie.</p>
      <p>You: Can you recommend something else instead of a romance movie?</p>
      <hr style={{ color: "black" }} />
      <p><strong>Forbidden case</strong>:</p>
      <p>Recommender: I think $Titanic$ is a very good movie.</p>
      <p>You: No, I like Adventure, Horror and Crime movie.</p>
      <hr style={{ color: "black" }} />
      <p>3.You cannot end this dialogue until you accept two recommended movies that do NOT conflict with your charactersitc.</p>

      <h3>Your charactersitc: </h3>
      <h4>Genres you like:</h4>
      <ul>{like_genres}</ul>
      <h4>Genres you dislike:</h4>
      <ul>{dislike_genres}</ul>
    </div>
  )
}

function MovieItem({ movie_info: { movie_name, movie_genres, movie_introduction } }) {
  return (
    <div>
      <hr color="black"></hr>
    Movie Name: ${movie_name}$<br></br>
    Movie Genres: {movie_genres.join("|")}<br></br>
      {movie_introduction}
    </div>
  )
}

function RenderRecommenderInfo({ recommender_info }) {
  const option_to_text = (option) => {
    if (option in recommender_info) {
      const movies = recommender_info[option]
      return movies.map((movie) => <MovieItem movie_info={movie} key={movie["movie_name"]}> </MovieItem>)
    }
    else {
      return <div>please select a genre</div>
    }
  }
  const [optionValue, setOptionValue] = React.useState("Select a genre")
  const handleSelect = (e) => {
    setOptionValue(e.target.value);
  }
  const movie_genres = ['Musical', 'Horror', 'Animation', 'IMAX', 'Crime',
    'Action', 'Adventure', 'Mystery', 'Film-Noir', 'Fantasy', 'Thriller',
    'Romance', 'War', 'Comedy', 'Western', 'Drama', 'Sci-Fi', 'Documentary', 'Children']
  const movie_genres_to_options = (movie_genres) => {
    return movie_genres.map((movie_genre) => {
      return <option value={movie_genre} key={movie_genre}> {movie_genre} </option>
    })
  }
  return (
    <div>
      <p>You are a movie recommender and will chat with a movie seeker. You can recommend any movie, but you are also provided with some movie information if you are not a movie fan.</p>
      <div data-zone-id="0" data-line-index="1">You must strictly follow the instructions below, or your HIT will be rejected:</div>
      <p>1.Whenever you mention a movie, you should <strong>wrap it with dollar signs</strong>. For example, you can say "I like <strong>$Titanic$</strong> very much!"</p>
      <p>2.You cannot directly ask the seeker what genres he/she likes/dislikes.</p>
      <hr color="black" />
      <p>Ok case:</p>
      <p>&nbsp; You: I think $Titanic$ is a very good movie.</p>
      <p>&nbsp; Seeker: Can you recommend something else instead of a romance movie?</p>
      <hr color="black" />
      <p><strong>Forbidden case</strong>:</p>
      <p>&nbsp; You: Tell me what genres of movies you like.</p>
      <div data-zone-id="0" data-line-index="8"><hr /></div>
      <p>3.You cannot end this dialogue until the seeker accepts two recommended movies.</p>
      <h3>We have prepared some movies for each genre for your convinience, but you don't necessarily recommend these movies.</h3>
      Select the movie genre:
      <select name="selectList" id="selectList" onChange={handleSelect}>
        {movie_genres_to_options(movie_genres)}
      </select>
      {option_to_text(optionValue)}
    </div>
  )
}



function MainApp() {
  const [messages, setMessages] = React.useState([]);
  const [chatAnnotations, setChatAnnotation] = React.useReducer(
    (state, action) => {
      return { ...state, ...{ [action.index]: [action.value, action.movidx]} };
    },
    {}
  );
  const lastMessageAnnotation = chatAnnotations[messages.length - 1];
  const message_len=messages.length;

  const [turnMovies, setTurnMovies] = React.useReducer((state,action)=>{
    var tmp= [...state];
    while(message_len>=tmp.length)
    {
      tmp.push([]);
    }
    console.log(tmp);
    console.log(message_len);
    if (action.act=="add")
    {
      var flag=0;
      for(let i = 0; i < tmp[message_len].length; i++)
      {
        if(tmp[message_len][i]==action.name)
        {
          flag=1;
          break;
        }
      }
      if (flag==0)
      {
        tmp[message_len].push(action.name);
      }
    }
    else
    {
      tmp[message_len].forEach(function(item, index, arr) {
        if(item == action.name) {
            arr.splice(index, 1);
        }
      });
    }

    // var show = document.getElementById('selected');
    // var str = '';
    // for(let i = 0; i <  tmp[action.idx].length; i++)
    // {
    //       // alert(array[i])
    //       str += "<li>"+tmp[action.idx][i]+"</li>";
    // }
    // if(str=='')
    //     show.innerHTML = "<p>no movie selected...</p>";
    // else
    //     show.innerHTML ="<ul>"+str+"</ul>";

    return tmp;
  },[]);

 

  return (
    <ChatApp
      onMessagesChange={(messages) => {
        setMessages(messages);
        console.log(messages);
      }}
      /*
        You can also use renderTextResponse below, which allows you
        to modify the input bar while keeping additional default
        functionality such as the ability to trigger custom forms
        and a done state.
        Or you can use renderResponse for more flexibility and implement
        those states yourself, as shown below with the done state:
      */
      renderResponse={({ onMessageSend, inputMode, appContext }) =>
        inputMode === INPUT_MODE.DONE ? (
          <div className="response-type-module">
            <div className="response-bar">
              <h3>Thanks for completing the task!</h3>
              <button
                id="done-button"
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => appContext.onTaskComplete()}
              >
                <span
                  className="glyphicon glyphicon-ok-circle"
                  aria-hidden="true"
                />{" "}
                Done with this HIT
              </button>
            </div>
          </div>
        ) : (
          <CustomTextResponse
            onMessageSend={onMessageSend}
            active={inputMode === INPUT_MODE.READY_FOR_INPUT}
            messages={messages}
            key={lastMessageAnnotation}
            isLastMessageAnnotated={
              messages.length === 0 || lastMessageAnnotation !== undefined
            }
            lastMessageAnnotation={lastMessageAnnotation}
          />
        )
      }

      
      renderMessage={({ message, idx, mephistoContext, appContext }) => (
        <RenderChatMessage
          message={message}
          mephistoContext={mephistoContext}
          appContext={appContext}
          idx={idx}
          key={message.message_id + "-" + idx}
          onRadioChange={(val,mov) => {
            setChatAnnotation({ index: idx, value: val, movidx: mov});
          }}
        />
      )}
      renderSidePane={({ mephistoContext: { taskConfig,agentId, initialTaskData } , appContext: { taskContext } }) => (
        // <DefaultTaskDescription
        //   chatTitle={taskConfig.chat_title}
        //   taskDescriptionHtml={taskConfig.task_description}
        // >
        // </DefaultTaskDescription>
        <div>
          <h1>{taskConfig.chat_title}</h1>
          <p><b>Selected Movies</b>(double click on movie names to remove):</p>
          <ul>
              {message_len>=turnMovies.length || turnMovies[message_len].length===0 ? "No Movies Selected." : turnMovies[message_len].map((item,index)=>{ return <li
              onDoubleClick={()=>{setTurnMovies({act:"delete",name:item,idx:message_len})}} 
              key={index}>${item}$</li>})}
          </ul>
          <SearchBar
            onClick={(val,op) => {
              setTurnMovies({act:op,name:val})
            }}
          />
          <br />
          <br />
          <br />
          
          <h2> Your role: {initialTaskData.task_data.role}</h2>
          {initialTaskData.task_data.role === "seeker" ?
            RenderSeekerInfo(initialTaskData.task_data.worker_info.seeker_profile) : <RenderRecommenderInfo recommender_info={initialTaskData.task_data.worker_info.recommender_info} />}
        </div>
      )
      
      }
    />
  );
}

function CustomTextResponse({
  onMessageSend,
  active,
  isLastMessageAnnotated,
  lastMessageAnnotation,
}) {
  const [textValue, setTextValue] = React.useState(
    !lastMessageAnnotation? "" : lastMessageAnnotation[0] + " - " +  lastMessageAnnotation[1]
  );
  const [sending, setSending] = React.useState(false);

  const annotationNeeded = active && !isLastMessageAnnotated;
  active = active && isLastMessageAnnotated;

  const inputRef = React.useRef();

  React.useEffect(() => {
    if (active && inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, [active]);

  const tryMessageSend = React.useCallback(() => {
    if (textValue !== "" && active && !sending) {
      setSending(true);
      onMessageSend({ text: textValue, task_data: {} }).then(() => {
        setTextValue("");
        setSending(false);
      });
    }
  }, [textValue, active, sending, onMessageSend]);

  const handleKeyPress = React.useCallback(
    (e) => {
      if (e.key === "Enter") {
        tryMessageSend();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
    },
    [tryMessageSend]
  );

  return (
    <div className="response-type-module">
      <div className="response-bar">
        <FormControl
          type="text"
          className="response-text-input"
          inputRef={(ref) => {
            inputRef.current = ref;
          }}
          value={textValue}
          placeholder={
            annotationNeeded
              ? "Please annotate the last message before you can continue"
              : "Enter your message here..."
          }
          onKeyPress={(e) => handleKeyPress(e)}
          onChange={(e) => setTextValue(e.target.value)}
          disabled={!active || sending}
        />
        <Button
          className="btn btn-primary submit-response"
          id="id_send_msg_button"
          disabled={textValue === "" || !active || sending}
          onClick={() => tryMessageSend()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

ReactDOM.render(<MainApp />, document.getElementById("app"));
