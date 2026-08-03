import mongoose from 'mongoose'


const PaymentSchema= new mongoose.Schema({
  userId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true,
  },
  planId : String, amount : Number, credits : Number, razorpayOrderId : String, razorpayPaymentId: String , 
  status: {
    type: String,
    enum : ["created", 'paid','failed']
    , default : 'created'
  }
},{ timestamps : true})

const Payment = mongoose.model ("Payment", PaymentSchema)
export default Payment;