const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class MoviesController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body;
        const user_id = request.user.id;

        if(rating < 1 || rating > 5) {
            throw new AppError("A nota deverá estar entre 1 e 5.");
        }

        const [movie_id] = await knex("movies").insert({
            title,
            description,
            rating,
            user_id
        });

        if(tags.length !== 0) {      
            const tagsInsert = tags.map(name => {
                return {
                    movie_id,
                    name,
                    user_id
                }
            });

            await knex("tags").insert(tagsInsert);
    }

        return response.status(201).json();
    }

    async show(request, response) {
        const { id } = request.params;

        const movie = await knex("movies").where({ id }).first();
        const tags = await knex("tags").where({ movie_id: id }).orderBy("id");

        return response.json({
            ...movie,
            tags
        })
    }

    async delete(request, response) {
        const { id } = request.params;

        const movieToBeDeleted = await knex("movies").where({ id }).delete();

        if(!movieToBeDeleted) {
            return response.json({
                message: "Filme já excluído"
            });
        }

        return response.json({
            message: "Filme deletado com sucesso"
        });
    }

    async index(request, response) {
        const { title, tags } = request.query;
        const user_id = request.user.id;

        let movies;

        if (tags) {
            const filterTags = tags.split(',').map(tag => tag.trim());

            movies = await knex("tags")
                .select([
                    "movies.id",
                    "movies.title",
                    "movies.user_id"
                ])
                .where("movies.user_id", user_id)
                .whereLike("movies.title", `%${title}%`)
                .whereIn("name", filterTags)
                .innerJoin("movies", "movies.id", "tags.movie_id")
                .orderBy("movies.title");
        } else if (title) {
            movies = await knex("movies")
                .where({ user_id })
                .whereLike("title", `%${title}%`)
                .orderBy("title");
        } else {
            movies = await knex("movies")
                .where({ user_id })
                .orderBy("title");
        }

        const userTags = await knex("tags").where({ user_id });
        const moviesWithTags = movies.map(movie => {
            const movieTags = userTags.filter(tag => tag.movie_id === movie.id);

            return {
                ...movie,
                tags: movieTags
            }
        });

        return response.json(moviesWithTags);
    }
}

module.exports = MoviesController;