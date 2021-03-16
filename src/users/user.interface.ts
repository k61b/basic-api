interface User {
    _id: string
    firstName: string
    lastName: string
    fullName: string
    email: string
    password: string
    address?: {
        country: string,
        city: string,
    }
}

export default User