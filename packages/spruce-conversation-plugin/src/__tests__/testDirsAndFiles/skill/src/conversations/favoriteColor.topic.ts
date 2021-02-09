import { TopicDefinition } from '../../../../../types/conversation.types'

const topicDefinition: TopicDefinition = {
	label: 'favorite color',
	utterances: ['favorite color'],
	script: [
		'what is your favorite color?',
		async (options) => {
			const answer = await options.ui.prompt({ type: 'text', isRequired: true })

			options.ui.renderLine(answer)
		},
	],
}

export default topicDefinition