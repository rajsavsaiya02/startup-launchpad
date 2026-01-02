const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('../database');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const googleId = profile.id;
                const name = profile.displayName;
                const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

                // Check if user exists
                const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                let user;
                if (userCheck.rows.length > 0) {
                    user = userCheck.rows[0];
                    // Update missing info if needed (e.g., if they signed up with email/password before)
                    if (!user.provider_id) {
                        await pool.query(
                            'UPDATE users SET provider = $1, provider_id = $2, avatar = $3, name = $4 WHERE id = $5',
                            ['google', googleId, avatar, name, user.id]
                        );
                    }
                } else {
                    // Create new user
                    const newUser = await pool.query(
                        'INSERT INTO users (email, name, provider, provider_id, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                        [email, name, 'google', googleId, avatar]
                    );
                    user = newUser.rows[0];
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

const GitHubStrategy = require('passport-github2').Strategy;

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: '/api/auth/github/callback',
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                const githubId = profile.id;
                const name = profile.displayName || profile.username;
                const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

                if (!email) {
                    return done(new Error('No email found from GitHub'), null);
                }

                // Check if user exists
                const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                let user;
                if (userCheck.rows.length > 0) {
                    user = userCheck.rows[0];
                    if (!user.provider_id) {
                        await pool.query(
                            'UPDATE users SET provider = $1, provider_id = $2, avatar = $3, name = $4 WHERE id = $5',
                            ['github', githubId, avatar, name, user.id]
                        );
                    }
                } else {
                    // Create new user
                    const newUser = await pool.query(
                        'INSERT INTO users (email, name, provider, provider_id, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                        [email, name, 'github', githubId, avatar]
                    );
                    user = newUser.rows[0];
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
