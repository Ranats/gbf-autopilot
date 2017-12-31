export default (context) => ({
  error: (payload, done, fail) => {
    fail("Action not found!");
  },
  poker: (modelName, done) => {
    done(context.Game.view[modelName + "Model"].attributes);  
  }
});
