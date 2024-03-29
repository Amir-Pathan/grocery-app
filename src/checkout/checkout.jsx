import { Paper,Grid,Typography, Button, Box } from '@mui/material'
import React,{Component} from 'react'
import services from '../services'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AddToCartButton from '../lib/addCartButton/addtocartButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import {Snackbar,Alert} from '@mui/material';


const style ={
    center:{
        textAlign:'center'
    }
}

class Checkout extends Component{

    constructor(){
        super()
        this.state={
            cart:[],
            item:[],
            addresses:[],
            addressId:'',
            isOpen:false,
            isdisable:false,
            customerId:'',
            isDataLoad:false
        }

        this.getCart=this.getCart.bind(this)
        this.handleChane=this.handleChane.bind(this)
        this.placeOrder=this.placeOrder.bind(this)
    }

    getCart(){

       const list = services.getCart()

       if(list.length>0){

        let promises = []

        const product =[]

        list.forEach((i)=>{

            promises.push(services.getSingelData('products',i.id))
        }

        )


        Promise.all(promises).then((res)=>{

            return {
                cart:res,
                item:list,

            }


        }).then((response)=>{

        let user = localStorage.getItem('user')

        user = JSON.parse(user)||{}

        
            if(user!==null){

                services.gerData('addresses','','customerId',user.id).then((res)=>{
        
                    if(res.length>0){
        
                        this.setState({
                            ...this.state,
                            addresses:res,
                            addressId:res[0].id,
                            customerId:user.id,
                            cart:response.cart,
                            item:response.item,
                            isDataLoad:true

                        })
        
                    }else{
        
                        this.handleChane('isdisable',true)
        
                    }
        
                })
        
                }

        })
        

       }else{

        

       }

    }
    componentDidMount(){


        this.getCart()


    }



    handleChane(k,e){

        console.log(e);

        this.setState({
            ...this.state,
            [k]:e
        })

    }

    placeOrder(){

        this.handleChane('isdisable',true)

        const date = new Date()

        const promise=[]

        this.state.cart.forEach((i,index)=>{

            const order ={
                productId:i.id,
                sellerId:i.sellerId,
                addressId:this.state.addressId,
                discountedPrice:Number(i.productDiscountedPrice),
                qty:Number(this.state.item[index].qty),
                customerId:this.state.customerId,
                status:"Placed",
                date : date.getDate()+'/'+date.getMonth()+'/'+date.getUTCFullYear()
            }

            promise.push(services.addData('orders',order))

        })

        Promise.all(promise).then((res)=>{
            localStorage.setItem('cart',JSON.stringify([]))

            this.handleChane('isOpen',true)

            window.location.pathname='/'

        })

    }

    render(){

        let total = 0;

        if(this.state.cart.length>0){

            this.state.cart.forEach((i,index)=>{

                total = total + Number(i.productDiscountedPrice)*Number(this.state.item[index].qty)

            })

        }

        const button=(
            <Button
            variant='contained'
            fullWidth
            onClick={()=>window.location.pathname='addAddress'}
            >Add Address</Button>
        )

        return(
            <>
               {
                !this.state.isDataLoad?'Loading':
                this.state.cart.length===0?
                  <h3 style={style.center}>Your Cart Is Empty</h3>
                :
                <>
                <Snackbar
                anchorOrigin={{
                    vertical:'top',
                    horizontal:'center'
                }}
                open={this.state.isOpen}
                autoHideDuration={3000}
                >
                    <Alert severity="success">Orders Place SuccessFully</Alert>
                </Snackbar>
                <h3>{this.state.cart.length} Items In Cart :</h3>
                <Grid container item xs={12} md={12} spacing={2}>
                    <Grid item xs={12} md={8}>
                         <Paper>
                             { !this.state.isDataLoad?null:
                                this.state.cart.map((i,index)=>{
                                    return <Grid key={index} container item xs={12} md={12} spacing={2}>
                                        <Grid item xs={3} md={3}>
                                            <img src={i.productImg}
                                            style={{width:'80px'}}
                                            />
                                        </Grid>
                                        <Grid container item xs={9} md={9}> 
                                             <Grid item xs={6} md={6}>
                                                <Typography variant='h6'>{i.productName}</Typography>
                                             </Grid>
                                             <Grid container item xs={6} md={6}>
                                                <Grid item xs={6} md={6}>
                                                    <CurrencyRupeeIcon/>
                                                    {i.productDiscountedPrice}
                                                </Grid>
                                                <Grid item xs={6} md={6}>
                                                    <CurrencyRupeeIcon/>
                                                    <strike>{i.productOriginalPrice}</strike>
                                                </Grid>
                                             </Grid>
                                             <Grid container item xs={12} md={12}>
                                                <Grid item xs={6} md={6}>
                                                    <Typography variant='h6'>{i.productQty}</Typography>
                                                </Grid>
                                                <Grid item xs={6} md={6} onClick={this.getCart}>
                                                    <AddToCartButton
                                                    id={i.id}
                                                    maxQty={i.productMaxQty}
                                                    stock={i.productStock}
                                                    />
                                                </Grid>
                                             </Grid>
                                        </Grid>
                                    </Grid>
                                })
                             }
                         </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <h3>Bills :</h3>
                        <Paper style={{paddingTop:'10px',paddingBottom:'10px'}}>
                            {
                                this.state.cart.map((i,index)=>{
                                    return <Grid key={index} container item xs={12} md={12} style={{marginLeft:'5px'}}>
                                        <Grid item xs={3} md={3}>
                                            {i.productName}
                                        </Grid>
                                        <Grid item xs={3} md={3}>
                                            {this.state.item[index].qty}
                                        </Grid>
                                        <Grid item xs={3} md={3}>
                                            <CurrencyRupeeIcon/>
                                            {i.productDiscountedPrice}
                                        </Grid>
                                        <Grid item xs={3} md={3}>
                                            <CurrencyRupeeIcon/>
                                            {Number(i.productDiscountedPrice)*Number(this.state.item[index].qty)}
                                        </Grid>
                                    </Grid>
                                })
                            }
                            <Grid container item xs={12} md={12}>
                                <Grid item xs={9} md={9}>
                                    Total :
                                </Grid>
                                <Grid item xs={3} md={3}>
                                    <CurrencyRupeeIcon/>
                                    {total}
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Paper>
                        <RadioGroup
                         aria-labelledby="demo-radio-buttons-group-label"
                         value={this.state.addressId}
                         name="radio-buttons-group"
                         onChange={(e)=>this.handleChane('addressId',e.target.value)}
                        >
                            {
                                this.state.addresses.length>0?
                                
                                   this.state.addresses.map((i,index)=>{

                                    return <FormControlLabel key={index} value={i.id} control={<Radio />} label={
                                        <Grid item xs={12} md={12}>{i.name} {i.no} {i.address} {i.landmark}</Grid>
                                    } />

                                   })
                                :null
                            }                        
                       </RadioGroup>
                         {button}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper>
                        <Grid container item xs={12} md={12}  alignItems='center'>
                        <Grid item xs={5} md={5}>Place Order</Grid>
                        <Grid item xs={7} md={7}>
                            <Button fullWidth variant='contained'
                            onClick={this.placeOrder}
                            disabled={this.state.isdisable}
                            >Place-Order</Button>
                        </Grid>
                        </Grid>
                        </Paper>
                    </Grid>
                </Grid>
                </>
               }
            </>
        )

    }

}

export default Checkout
