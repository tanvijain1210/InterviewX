import mongoose, {Schema} from 'mongoose'

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String, required: true
        },
        email: {
            type: String, unique: true, required: true
        },
        credit: { type: Number, default : 200 }
    },  {timestamp : true}
)

const User = mongoose.model ('User', UserSchema)

export default User;