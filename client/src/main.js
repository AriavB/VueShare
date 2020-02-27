import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
import FormAlert from './components/Shared/FormAlert'

// register global component
Vue.component('form-alert', FormAlert);

Vue.use(VueApollo);

// Setup apollo client
export const defaultClient = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  // include authorization token as header with request to backend
  fetchOptions: {
    credentials: 'include'  
  },
  request: operation => {
    // operation adds token to auth headers and send to backend
    if (!localStorage.token) {
      localStorage.setItem('token', '');
    }
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      console.log('[networkError]', networkError);
    }   
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err);
        if (err.name === "AuthenticationError") {
          store.commit('setAuthError', err);
          store.dispatch('signoutUser');
        }
      }
    }
  }
});

const apolloProvider = new VueApollo({ defaultClient });

Vue.config.productionTip = false;

new Vue({
  apolloProvider,
  router,
  store,
  vuetify,
  render: h => h(App),
  created() {
    this.$store.dispatch('getCurrentUser');
  }
}).$mount('#app')
