import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import {
  getProducts,
  getBraintreeClientToken,
  processservicenamement,
  createOrder,
} from "./apiCore";
import { emptyCart } from "./cartHelpers";
import Card from "./Card";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";

const Checkout = ({ products, setRun = (f) => f, run = undefined }) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    clientToken: null,
    error: "",
    instance: {},
    address: "",
  });

  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;

  const getToken = (userId, token) => {
    getBraintreeClientToken(userId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
        setData({ ...data, error: data.error });
      } else {
        console.log(data);
        setData({ clientToken: data.clientToken });
      }
    });
  };

  useEffect(() => {
    getToken(userId, token);
  }, []);

  const handleAddress = (event) => {
    setData({ ...data, address: event.target.value });
  };

  const getTotal = () => {
    return products.reduce((currentValue, nextValue) => {
      return currentValue + nextValue.count * nextValue.price;
    }, 0);
  };

  const showCheckout = () => {
    return isAuthenticated() ? (
      <div>{showDropIn()}</div>
    ) : (
      <Link to="/signin">
        <Button variant="contained" color="primary">
          Sign in to checkout
        </Button>
      </Link>
    );
  };

  let deliveryAddress = data.address;

  const buy = () => {
    setData({ loading: true });

    // let nonce;
    // let getNonce = data.instance
    //   .requestservice namementMethod()
    //   .then((data) => {
    //     // console.log(data);
    //     nonce = data.nonce;
    //     // once you have nonce (card type, card number) send nonce as 'service namementMethodNonce'
    //     // and also total to be charged
    //     // console.log(
    //     //     "send nonce and total to process: ",
    //     //     nonce,
    //     //     getTotal(products)
    //     // );
    //     const service namementData = {
    //       service namementMethodNonce: nonce,
    //       amount: getTotal(products),
    //     };

    //     processservice namement(userId, token, service namementData)
    //       .then((response) => {
    //         console.log(response);
    //         // empty cart
    //         // create order

    //         const createOrderData = {
    //           products: products,
    //           transaction_id: response.transaction.id,
    //           amount: response.transaction.amount,
    //           address: deliveryAddress,
    //         };

    //         createOrder(userId, token, createOrderData)
    //           .then((response) => {
    //             emptyCart(() => {
    //               setRun(!run); // run useEffect in parent Cart
    //               console.log('service namement success and empty cart');
    //               setData({
    //                 loading: false,
    //                 success: true,
    //               });
    //             });
    //           })
    //           .catch((error) => {
    //             console.log(error);
    //             setData({ loading: false });
    //           });
    //       })
    //       .catch((error) => {
    //         console.log(error);
    //         setData({ loading: false });
    //       });
    //   })
    //   .catch((error) => {
    //     // console.log("dropin error: ", error);
    //     setData({ ...data, error: error.message });
    //   });
    const createOrderData = {
      products: products,
      transaction_id: "",
      amount: "",
      address: deliveryAddress,
    };

    createOrder(userId, token, createOrderData)
      .then((response) => {
        emptyCart(() => {
          setRun(!run); // run useEffect in parent Cart
          console.log("service namement success and empty cart");
          setData({
            loading: false,
            success: true,
          });
        });
      })
      .catch((error) => {
        console.log(error);
        setData({ loading: false });
      });
  };

  const showDropIn = () => (
    <div onBlur={() => setData({ ...data, error: "" })}>
      {data.clientToken !== null && products.length > 0 ? (
        <div>
          <div className="gorm-group mb-3">
            <label className="text-muted">Delivery address:</label>
            <textarea
              onChange={handleAddress}
              className="form-control"
              value={data.address}
              placeholder="Type your delivery address here..."
            />
          </div>

          <DropIn
            options={{
              authorization: data.clientToken,
              servicenamepal: {
                flow: "vault",
              },
            }}
            onInstance={(instance) => (data.instance = instance)}
          />
          <a href="https://rzp.io/l/TiIhDHZ" 
          <button onClick={buy} className="btn btn-success btn-block">
            service name
          </button>
        </div>
      ) : null}
    </div>
  );

  const showError = (error) => (
    <div
      className="alert alert-danger"
      style={{ display: error ? "" : "none" }}
    >
      {error}
    </div>
  );

  const showSuccess = (success) => (
    <div
      className="alert alert-info"
      style={{ display: success ? "" : "none" }}
    >
      Thanks! Your service namement was successful!
    </div>
  );

  const showLoading = (loading) =>
    loading && <h2 className="text-danger">Loading...</h2>;

  return (
    <div>
      {/* <h2>Total: ${getTotal()}</h2> */}
      {showLoading(data.loading)}
      {showSuccess(data.success)}
      {showError(data.error)}
      {showCheckout()}
    </div>
  );
};

export default Checkout;
