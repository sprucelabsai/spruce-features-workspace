import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { ConversationCoordinator } from '../../conversations/ConversationCoordinator'
import AbstractConversationTest from '../../tests/AbstractConversationTest'
import { SendMessage } from '../../types/conversation.types'

export default class TopicCoordinatorTest extends AbstractConversationTest {
	private static coordinator: ConversationCoordinator
	private static sentMessages: SendMessage[] = []
	protected static async beforeEach() {
		await super.beforeEach()

		this.coordinator = await ConversationCoordinator.Coordinator({
			sendMessageHandler: async (message) => {
				this.sentMessages.push(message)
			},
			topicLookupPath: this.resolveTestPath('skill', 'src'),
		})
	}

	@test()
	protected static async canCreateTopicCoordinator() {
		assert.isTruthy(this.coordinator)
	}

	@test()
	protected static async hasHandleMessage() {
		assert.isFunction(this.coordinator.handleMessage)
	}

	@test()
	protected static async handledMessageMustHaveASource() {
		const err = await assert.doesThrowAsync(() =>
			this.coordinator.handleMessage(this.buildMessage({ body: 'waka waka' }))
		)

		errorAssertUtil.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['source.personId'],
		})
	}

	@test()
	protected static async respondsWithNoSuggestedTopicsToFirstMessage() {
		const results = await this.coordinator.handleMessage(
			this.buildMessage({ body: 'waka waka', source: { personId: '1234' } })
		)

		assert.isArray(results.suggestedTopics)
		assert.isLength(results.suggestedTopics, 0)
	}

	@test()
	protected static async respondsWithSuggestedTopicsToFirstMessage() {
		const results = await this.coordinator.handleMessage(
			this.buildMessage({ body: 'help me book!', source: { personId: '1234' } })
		)

		assert.isArray(results.suggestedTopics)
		assert.isLength(results.suggestedTopics, 1)
	}

	@test()
	protected static async handlesNoSkillWithTopics() {
		const coordinator = await ConversationCoordinator.Coordinator({
			topicLookupPath: this.cwd,
			sendMessageHandler: async () => {},
		})

		const results = await coordinator.handleMessage(
			this.buildMessage({ body: 'help me book!', source: { personId: '1234' } })
		)

		assert.isArray(results.suggestedTopics)
		assert.isLength(results.suggestedTopics, 0)
	}

	@test()
	protected static async throwsWhenSentBadTopic() {
		const err = await assert.doesThrowAsync(() =>
			this.coordinator.handleMessage(
				this.buildMessage({ body: '1', source: { personId: '1234' } }),
				'aoeu'
			)
		)

		errorAssertUtil.assertError(err, 'TOPIC_NOT_FOUND', {
			suppliedTopic: 'aoeu',
			validTopics: ['bookAppointment', 'cancelAppointment'],
		})
	}

	@test()
	protected static async playsScriptWhenTopicIsSelected() {
		await this.coordinator.handleMessage(
			this.buildMessage({ body: '1', source: { personId: '1234' } }),
			'bookAppointment'
		)

		assert.isLength(this.sentMessages, 2)
		assert.isEqual(this.sentMessages[0].body, 'Sweet, lets book!')
	}
}