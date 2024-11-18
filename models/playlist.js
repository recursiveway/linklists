import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a playlist name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Playlist must belong to a user']
  },
  links: [{
    url: {
      type: String,
      required: true
    },
    embedCode: {
      type: String,
      required: true
    },
    description: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
playlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);

export default Playlist;
