const Post= require("../models/Post");
const createPost=async(req,res)=>{
    try{
        
        const {content
        }= req.body;

        if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

        const Post= await Post.create({
              content: content.trim(),
              author: req.user,
              
            });
    }
    catch (err) {
    console.error("CREATE COMMENT ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
};
}
const getPosts= async(req, res)=>{
    try{
        const posts=await Post.find();
        if(!posts) return res.status(401).json({
            message: "No post found",
        })
        res.status(200).json({
            posts
        })
    }
    catch(error){
        res.status(500).json({
            message: "Server error"
        })
    }
};
const getPostById= async(req, res)=> {
    try{
        const {id}= req.body.params;
        const post=await Post.findById(id);
        if(!post) return res.status(401).json({
            message: "POst not found",
        })
        res.status(200).json({
            post
        })
    }
    catch(error){
        res.status(500).json({
            message: "Server error"
        })
    }
};
const deletePost=async(req, res)=> {
    try{
        const {id} = req.params;
        const post= await Post.findOneByIdAndDelete(id);
        if(!post) return res.status(401).json({message: "Erro"});
        res.status(200).json({
            message: "Post Deleted"
        })
    }
    catch(error){
        res.status(500).json({
            message: "Server error"
        })
    }
};
const updatePost=async(req, res)=> {
    try{
        const {id}= req.params.id;
        const post=await Post.findById(id);
        const {title, content}= req.body;
        if(!post) return res.status(404).json({messsage: "Post not found"})
        
        const editTimeLimit= 15 * 60 * 1000;
        const currentTime= new Date().getTime();
        const postCreationTime= new Dat(post.createdAt).getTime();

        if (currentTime - postCreationTime> editTimeLimit){
            return res.status(403).json({message: "Editing time window has expired"});
        }

        const newPost= await Post.save({
            title, 
            content,
            isEdited : true,
        })

        res.status(201).json({message: "Post created sucesfully", newPost})
    }
    catch(error){
        res.status(500).json({
            message: 'Server error', error
        })
    }
};
const likePost=async (req, res) => {
    const {id} =req.params;

    try {
        
        const post= await Post.findById(id);
        if(!post){
            return res.status(404).json({
                message: "Post not found"
            })
        }
        const alreadyLiked= post.likes.some(
            (userId)=> userId.toString()==req.user.toString()
        );
        if (alreadyLiked){
            post.likes.pull(req.user)
        }
        else{
            post.likes.push(req.user);
        }
        await post.save();
    } catch (error) {
        res.status(500).json({
            message: "Server Error", error,
        })
    }
};

module.exports={
    createPost,
    getPosts,
    getPostById,
    deletePost,
    updatePost,
    likePost,
} 