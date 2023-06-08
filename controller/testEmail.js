const { sendMail } = require("../helpers/helpers")

exports.testEmail = async (req,res) => {
    try {
       const resp =  await sendMail({
            to:'buchilaz98@gmail.com',
            from: 'squarehubnigeria@gmail.com',
            subject: 'Does this work?',
            text: 'If you\re seeing this, yes!',
            html:''
        })
        console.log(resp)
    //    res.status(200).json({error: false, data: resp})

    } catch (error) {
        console.log(error)
        // res.status(500).json({error: true, data: null})

    }
}