/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React, { useState } from 'react';
import ReactDOM from "react-dom";
import "bootstrap-chat/styles.css";
import "./style.css";

import { ChatApp, ChatMessage, DefaultTaskDescription } from "bootstrap-chat";

function RenderChatMessage({ message, mephistoContext, appContext, idx }) {
  const { agentId } = mephistoContext;
  const { currentAgentNames } = appContext.taskContext;

  return (
    <div>
      <ChatMessage
        isSelf={message.id === agentId || message.id in currentAgentNames}
        agentName={
          message.id in currentAgentNames
            ? currentAgentNames[message.id]
            : message.id
        }
        message={message.text}
        taskData={message.task_data}
        messageId={message.message_id}
      />
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
  const [optionValue, setOptionValue] = useState("Select a genre")
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
  return (
    <ChatApp
      renderMessage={({ message, idx, mephistoContext, appContext }) => (
        <RenderChatMessage
          message={message}
          mephistoContext={mephistoContext}
          appContext={appContext}
          idx={idx}
          key={message.message_id + "-" + idx}
        />
      )}
      renderSidePane={({ mephistoContext: { taskConfig, agentId, initialTaskData }, appContext: { taskContext } }) => {
        return (
          <div>
            {/* <DefaultTaskDescription
              chatTitle={taskConfig.chat_title}
              taskDescriptionHtml={taskConfig.task_description}
            >
            </DefaultTaskDescription> */}
            <h1>{taskConfig.chat_title}</h1>
            {/* <h2> Your agent id: {agentId}</h2>
            <h2> taskContext: {JSON.stringify(taskContext)}</h2>
            {/* <h2> taskConfig: {JSON.stringify(taskConfig)}</h2>
          <h2> initialTaskData: {JSON.stringify(initialTaskData)}</h2> */}
            <h2> Your role: {initialTaskData.task_data.role}</h2>
            {initialTaskData.task_data.role === "seeker" ?
              RenderSeekerInfo(initialTaskData.task_data.worker_info.seeker_profile) : <RenderRecommenderInfo recommender_info={initialTaskData.task_data.worker_info.recommender_info} />}
          </div>
        )
      }
      }
    />
  );
}

ReactDOM.render(<MainApp />, document.getElementById("app"));
