import React from 'react';
import axios from 'axios';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ToolBox from 'components/ToolBox';
import Product from 'components/Product';
import AddInventory from 'pages/AddInventory';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

class Products extends React.Component {
  state = {
    products: [],
    sourceProducts: [],
    isLoading: false,
    errorMsg: '',
    page: 0,
    showButton: false
    // cartNum: 0,
  }

  loadMore = () => {
    this.setState((prevState) => ({
      page: prevState.page + 1
    }));
  };

  loadSourceProducts = async () => {
    try {
      const response = await axios.get('http://140.117.71.141:3001/api/sourceProducts')
      this.setState({ sourceProducts: response.data })
    } catch (error) {
      this.setState({
        errorMsg: 'Error while loading data. Try again later.'
      });
    }
  }

  loadProducts = async () => {
    const { page } = this.state;
    this.setState({ isLoading: true });
    if (!global.auth.isLogin() || (global.auth.getUser() || {}).isStaff === 1) {
      try {
        const response = await axios.get(
          'http://140.117.71.141:3001/api/getProducts?page=' + page
        );

        this.setState((prevState) => ({
          products: [...prevState.products, ...response.data],
          errorMsg: ''
        }));
      } catch (error) {
        this.setState({
          errorMsg: 'Error while loading data. Try again later.'
        });
      } finally {
        this.setState({ isLoading: false });
      }
    }
    else {
      const user = global.auth.getUser() || {}
      const uId = user.uId;
      try {
        const response = await axios.post(
          `http://140.117.71.141:3001/api/recommendProducts/?page=${page}`, { uId }
        );
        this.setState((prevState) => ({
          products: [...prevState.products, ...response.data],
          errorMsg: ''
        }));
      } catch (error) {
        this.setState({
          errorMsg: 'Error while loading data. Try again later.'
        });
      } finally {
        this.setState({ isLoading: false });
      }
      // this.updateCartNum()
    }
  };


  componentDidMount() {
    this.loadProducts();
    this.loadSourceProducts();
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        this.setState({ showButton: true });
      } else {
        this.setState({ showButton: false });
      }
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      this.loadProducts();
    }
  }

  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // for smoothly scrolling
    });
  };

  // search
  search = (text) => {
    // 1. Get New Array
    let _products = [...this.state.sourceProducts]
    // 2. Filter New Array
    _products = _products.filter((p) => {
      // name: Abcd text: ab   ===> ['Ab']
      // text: '' ==> ["", "", "", "", ""]
      const matchArray = p.name.match(new RegExp(text, "gi"))
      return !!matchArray
    })

    // 3. set State
    this.setState({
      products: _products,
    })
  }



  add = (product) => {
    const _products = [...this.state.products]
    _products.push(product)
    const _sProducts = [...this.state.sourceProducts]
    _sProducts.push(product)

    this.setState({
      products: _products,
      sourceProducts: _sProducts,
    })
  }

  update = (product) => {
    const _products = [...this.state.products]
    const _index = _products.findIndex((p) => p.id === product.id)
    _products.splice(_index, 1, product)
    const _sProducts = [...this.state.sourceProducts]
    const _sIndex = _products.findIndex((p) => p.id === product.id)
    _sProducts.splice(_sIndex, 1, product)
    this.setState({
      products: _products,
      sourceProducts: _sProducts,
    })
  }

  delete = (id) => {
    const _products = this.state.products.filter((p) => p.id !== id)
    const _sProducts = this.state.sourceProducts.filter((p) => p.id !== id)
    this.setState({
      products: _products,
      sourceProducts: _sProducts,
    })
  }

  // updateCartNum = async () => {
  //   const cartNum = await this.initCartNum()
  //   this.setState({
  //     cartNum: cartNum,
  //   })
  // }

  // initCartNum = async () => {
  //   const user = global.auth.getUser() || {}
  //   const res = await axios.get("http://140.117.71.141:3003/carts", {
  //     params: {
  //       userId: user.email,
  //     },
  //   })
  //   const carts = res.data || []
  //   const cartNum = carts
  //     .map((cart) => cart.mount) // [2, 1,2 ]
  //     .reduce((a, value) => a + value, 0)
  //   return cartNum
  // }

  render() {
    const { isLoading, errorMsg } = this.state;
    return (
      <div>
        <ToolBox search={this.search} cartNum={this.state.cartNum} />
        {isLoading && <p className="loading">Loading...</p>}
        {errorMsg && <p className="errorMsg">{errorMsg}</p>}
        <div className="products">
          {/* <div className="columns is-multiline is-desktop"> */}
          <TransitionGroup component={null}>
            {this.state.products.map(p => {

              return (
                <CSSTransition
                  classNames="product-fade"
                  timeout={300}
                  key={p.pId}
                >
                  <div className="" key={p.pId}>
                    <Product
                      product={p}
                      update={this.update}
                      delete={this.delete}
                      updateCartNum={this.updateCartNum}
                    />
                  </div>

                </CSSTransition>
              );
            })}
          </TransitionGroup>
          {this.state.showButton && (
            <button onClick={this.scrollToTop} className="back-to-top">
              <i className="fas fa-chevron-up" />
            </button>
          )}
        </div>
        <button onClick={this.loadMore} className="btn-grad">
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      </div>

    )
  }
}

export default withRouter(Products);
